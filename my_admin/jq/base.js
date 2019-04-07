// start функції обробки мінікарти в svg
function _create_svg_city_name(svg, projection, coordinates, text) {
    let count = text.toString().length;
    let procentage = count / 2;
    let center = -6;
    if (count >= 16) {center=-5.6}
    if (count >= 22) {center=-3}
    if (count >= 32) {center=-2}
    svg.selectAll("pin")
        .data([coordinates]).enter()
        .append("g")
        .append("text")
        .attr("x", function(d){return projection(d)[0]})
        .attr("y", function(d){return projection(d)[1]})
        .text(text)
        .attr("font-size", "10px")
        .attr("fill", "#a9afbd")
        .attr("class", "text-city")
        .attr("transform", "translate(" + (center * procentage) +  ",-10)");
}
function _create_svg_circle(svg, projection, coordinates, fill_color, fill_color_center) {
    svg.selectAll("pin")
        .data([coordinates]).enter()
        .append("circle")
        .attr("cx", function(d){return projection(d)[0]})
        .attr("cy", function(d){return projection(d)[1]})
        .attr("r", "5px")
        .attr("fill", fill_color);
    svg.selectAll("pin")
        .data([coordinates]).enter()
        .append("circle")
        .attr("cx", function(d){return projection(d)[0]})
        .attr("cy", function(d){return projection(d)[1]})
        .attr("r", "2px")
        .attr("fill", fill_color_center);
}
function _create_svg_path(svg, path, path_coordinates, css_class) {
    svg.append("path")
        .datum(path_coordinates)
        .attr("class", css_class)
        .attr("d", path);
}
function _create_circle_road(svg, projection, data_cord, data, circleColor, circleColorCenter) {
    if (data_cord && data_cord.coordinates && data_cord.coordinates.length != 0) {
        _create_svg_circle(svg, projection, data_cord.coordinates[0], circleColor, circleColorCenter);
        _create_svg_circle(svg, projection, data_cord.coordinates[data_cord.coordinates.length-1], circleColor, circleColorCenter);
        if (data.cities && data.cities.length != 0) {
            for (let i=0;i<data.cities.length;i++) {
                for (let j=1;j<data_cord.coordinates.length-1;j++) {
                    if (data.cities[i].coordinates[0] == data_cord.coordinates[j][0] && data.cities[i].coordinates[1] == data_cord.coordinates[j][1]) {
                        _create_svg_circle(svg, projection, data.cities[i].coordinates, circleColor, circleColorCenter)
                    }
                }
            }}
    }
}
function create_mini_map_svg(data, box_selector) {
    if (!data.road || data.road.length == 0) {
        //console.log('На має даних');
        return
    }

    let lineString = {type: 'LineString', coordinates: data.road};

    let box_width = 350,
        box_height = 350;

    "------ Ihor Kypeshchuk | tetrafishka@gmail.com ------";
    let projection = d3.geo.mercator().scale(1).translate([0, 0]),
        path = d3.geo.path().projection(projection);
    let bounds = path.bounds(lineString),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .7 / Math.max(dx / box_width, dy / box_height),
        translate = [box_width / 2 - scale * x, box_height / 2 - scale * y];
    projection.scale(scale).translate(translate);
    "------ Ihor Kypeshchuk | tetrafishka@gmail.com ------";

    let svg = d3.select(box_selector)
        .append("svg")
        .attr("width", box_width)
        .attr("height", box_height);

    let circleColor = '#f4f3f4',
        circleColorCenter = '#cbcbcb',
        circleColorDone = '#46dfba',
        circleColorDoneCenter = '#00acac',
        circleColorDownAsphalt = '#7fffe1',
        circleColorDownAsphaltCenter = '#50e3c2',
        circleColorSchedule = '#fdb449',
        circleColorScheduleCenter = '#f7e31c';

    function colorTypeChecked(type) {
        if (type.toString() === data.types.TYPE_TOP.toString()){
            return {classStyle: "road-success",
                typeCircleColor: circleColorDone,
                typeCircleColorCenter: circleColorDoneCenter}
        }
        if (type.toString() === data.types.TYPE_BOTTOM.toString()){
            return {classStyle: "road-down-asphalt",
                typeCircleColor: circleColorDownAsphalt,
                typeCircleColorCenter: circleColorDownAsphaltCenter}
        }
        if (type.toString() === data.types.TYPE_SCHEDULE.toString()){
            return {classStyle: "road-schedule",
                typeCircleColor: circleColorSchedule,
                typeCircleColorCenter: circleColorScheduleCenter}
        }
        return null
    }

    function _created_cities(cities, colorType) {
        if (cities && cities.length !== 0) {
            for (let i=0;i<cities.length;i++) {
                _create_svg_city_name(svg, projection, cities[i].coordinates, cities[i].name);
                if (i !== 0 || i !== (cities.length - 1)) {
                    _create_svg_circle(svg, projection, cities[i].coordinates,
                        colorType.typeCircleColor, colorType.typeCircleColorCenter);
                }
            }
        }
    }
    if (data.is_type) {
        let colorType = colorTypeChecked(data.is_type);
        if (colorType) {
            _create_svg_path(svg, path, lineString, colorType.classStyle);
            _create_svg_circle(svg, projection, data.road[0],
                colorType.typeCircleColor, colorType.typeCircleColorCenter);
            _create_svg_circle(svg, projection, data.road[data.road.length-1],
                colorType.typeCircleColor, colorType.typeCircleColorCenter);
            _created_cities(data.cities, colorType);
            return null
        }
    }

    _create_svg_path(svg, path, lineString, "road-default");
    _create_svg_circle(svg, projection, data.road[0], circleColor, circleColorCenter);
    _create_svg_circle(svg, projection, data.road[data.road.length-1], circleColor, circleColorCenter);

    if (data.parts && data.parts.length > 0) {
        for (let i=0; i<data.parts.length; i++) {
            for (let [type, value] of Object.entries(data.parts[i])) {
                if (value.length > 1) {
                    let colorType = colorTypeChecked(type);
                    let lineStringPart = {
                        type: 'LineString',
                        coordinates: value
                    };
                    if (colorType) {
                        _create_svg_path(svg, path, lineStringPart, colorType.classStyle);
                        _create_svg_circle(svg, projection, value[0],
                            colorType.typeCircleColor, colorType.typeCircleColorCenter);
                        _create_svg_circle(svg, projection, value[value.length - 1],
                            colorType.typeCircleColor, colorType.typeCircleColorCenter);
                    }
                }
            }
        }
    }

    let colorType = {typeCircleColor: circleColor, typeCircleColorCenter: circleColorCenter};
    _created_cities(data.cities, colorType);
}
// end функції обробки мінікарти в svg


// start шаблон інфо вікна на маркері
function mapMarkerInfoWindowTpl(obj) {
    if (obj.title_cities.length > 50) {
        obj.title_cities = obj.title_cities.substring(0, 50) + '...';
    }

    return `
    <div class="open-card" value="${obj.title_img}" data-id="${obj.id}">
      <div class="open-card__left-side">
        <div class="open-card__left-side-wraper">
          <div class="open-card__header">
            <div class="open-card__icon-block">
              <div class="open-card__icon-wrapper">
                <div class="open-card__icon">${obj.title_num}</div>
              </div>
            </div>
            <div class="open-card__road-info">
              <div class="open-card__location js-open-card__city" > ${obj.title_cities}</div>
           
            </div>
          </div><!--open-card__header-->
          <div class="open-card__body">
              <div class="open-card__body-row">
                <div class="open-card__body-col">${obj.labels.type_repair}</div>
                <div class="open-card__body-col type-of-repair"  data-type-repair="${obj.svg_id}">${obj.type_repair}</div>
              </div>
              <div class="open-card__body-row">
                <div class="open-card__body-col">${obj.labels.road_length_km}</div>
                <div class="open-card__body-col">${obj.length_km}</div>
              </div>
              <div class="open-card__body-row">
                <div class="open-card__body-col">${obj.labels.status}</div>
                <div class="open-card__body-col done-date ">${obj.done_date}</div>
              </div>
              <div class="open-card__body-row">
                <div class="open-card__body-col">${obj.labels.fin_origin}</div>
                <div class="open-card__body-col">${obj.fin_origin}</div>
              </div>
              <div class="open-card__body-row">
                <div class="open-card__body-col">${obj.labels.customer}</div>
                <div class="open-card__body-col ">${obj.customer}</div>
              </div>
            </div><!--open-card__body-->
            <div class="open-card__footer">
            <div class="open-card__references">
              <p class="open-card__share">${obj.labels.links}</p>
              <div class="open-card__reference-icons">
                  <a href="https://www.linkedin.com/shareArticle?mini=true
                     &url=http://pbs.bukovel.ua${obj.detail_url}
                     &title=PBS
                     &summary=
                     &source=" target="_blank">
                    <i class="linkedin-i">
                      <svg class="reference-svg linkedin-reference">
                        <use xlink:href="#icon-linkedin"></use>
						<svg id="icon-linkedin" viewBox="0 0 19 19" width="100%" height="100%">
          <title>Fill 1</title><path d="M17.051 6.979L14.03 10a.7.7 0 0 1-1 0 .712.712 0 0 1 0-1.01l3.021-3.021a2.143 2.143 0 0 0 0-3.019 2.144 2.144 0 0 0-3.021 0L9 6.979C8.75 7.229 7.58 8.58 9 10c.28.28.28.729 0 1.009a.729.729 0 0 1-1.01 0c-1.99-2-.87-4.17 0-5.04l4.031-4.019a3.553 3.553 0 0 1 5.03 0 3.554 3.554 0 0 1 0 5.029m-6.04 6.04l-4.021 4.03a3.585 3.585 0 0 1-5.04 0 3.587 3.587 0 0 1 0-5.04L4.971 8.99a.71.71 0 0 1 1.01 0c.28.279.28.729 0 1.01L2.96 13.019c-.83.83-.83 2.19 0 3.021.83.83 2.191.83 3.021 0l4.03-4.031c.239-.25 1.42-1.599 0-3.019a.7.7 0 0 1 0-1 .698.698 0 0 1 1 0c1.989 1.989.869 4.159 0 5.029" fill-rule="evenodd"></path>
        </svg>
                      </svg>
                    </i>
                  </a>
                  <a href="http://www.facebook.com/sharer.php?u="
                     data-url="http://pbs.bukovel.ua${obj.detail_url}"
                     onclick="return Share.me(this);"
                     class="reference-item facebook" target="_blank">
                    <i class="facebook-i">
                      <svg class="reference-svg facebook-reference">
                          <use xlink:href="#icon-fb"></use>
						  <svg id="icon-fb" viewBox="0 0 9 20" width="100%" height="100%">
          <title>Фігура_2_копія</title><path d="M8.636 9.98H5.967V20H1.924V9.98H0V6.459h1.924V4.18C1.924 2.551 2.68 0 6 0l3 .012V3.43H6.825a.833.833 0 0 0-.858.96v2.072h3.022L8.636 9.98z" fill-rule="evenodd"></path>
        </svg>
                      </svg>
                    </i>
                  </a>
                  <a href="https://plus.google.com/share?url="
                     data-url="http://pbs.bukovel.ua${obj.detail_url}"
                     class="googleplus"
                     onclick="return Share.me(this);" target="_blank">
                    <i class="google-i">
                      <svg class="reference-svg google-reference">
                        <use xlink:href="#icon-gmail"></use>
						<svg id="icon-gmail" viewBox="0 0 19 12" width="100%" height="100%">
          <title>Фігура_3_копія</title><path d="M6.661 7.237h2.97A3.774 3.774 0 0 1 5.9 9.725a3.763 3.763 0 0 1-3.49-2.808 3.706 3.706 0 0 1 1.715-4.109 3.812 3.812 0 0 1 4.48.435.413.413 0 0 0 .556 0l1.09-1.012a.4.4 0 0 0 0-.586A6.096 6.096 0 0 0 6.195.001C2.868-.062.108 2.527.004 5.811c-.106 3.282 2.482 6.039 5.806 6.183 3.324.145 6.147-2.377 6.335-5.656l.007-1.377h-5.49a.405.405 0 0 0-.408.402v1.473c0 .222.183.401.407.401zm10.523-2.143v-1.44a.35.35 0 0 0-.104-.25.359.359 0 0 0-.253-.104h-1.228a.355.355 0 0 0-.357.352v1.442h-1.459a.355.355 0 0 0-.357.352v1.212c0 .194.16.352.357.352h1.459v1.44c0 .195.16.352.357.352h1.228a.359.359 0 0 0 .253-.102.35.35 0 0 0 .104-.25V7.01h1.46a.359.359 0 0 0 .252-.103.35.35 0 0 0 .104-.25v-1.21a.35.35 0 0 0-.105-.25.359.359 0 0 0-.252-.102h-1.459v-.001z"></path>
        </svg>
                      </svg>
                    </i>
                  </a>
                  <a href="http://twitter.com/share?url="
                     data-url="http://pbs.bukovel.ua${obj.detail_url}"
                     class="twitter"
                     onclick="return Share.me(this);" target="_blank">
                      <i class="twitter-i">
                      <svg class="reference-svg twitter-reference">
                          <use xlink:href="#icon-twitter"></use>
						  <svg id="icon-twitter" viewBox="0 0 15 12" width="100%" height="100%">
          <title>Page 1</title><path d="M4.712 12c5.66 0 8.757-4.618 8.757-8.616 0-.13 0-.26-.006-.39A6.215 6.215 0 0 0 15 1.424a6.318 6.318 0 0 1-1.77.478A3.056 3.056 0 0 0 14.585.224a6.185 6.185 0 0 1-1.957.733A3.096 3.096 0 0 0 10.384 0c-1.699 0-3.08 1.358-3.08 3.03 0 .236.03.466.079.69A8.789 8.789 0 0 1 1.038.555 2.992 2.992 0 0 0 .624 2.08c0 1.05.546 1.978 1.369 2.521A3.152 3.152 0 0 1 .6 4.222v.042c0 1.464 1.063 2.693 2.467 2.97a3.05 3.05 0 0 1-.81.107 3.07 3.07 0 0 1-.576-.054A3.072 3.072 0 0 0 4.556 9.39a6.238 6.238 0 0 1-3.824 1.299A6.02 6.02 0 0 1 0 10.648 8.86 8.86 0 0 0 4.712 12" fill-rule="evenodd"></path>
        </svg>
                      </svg>
                      </i>
                  </a>
              </div><!--references-icons-->
            </div><!--references-block-->
              <div class="report-button-block">
                <a href="${obj.gallery_url}" class="report-button">${obj.labels.photos}</a>
              </div>
            </div><!--open-card__footer-->
        </div><!--open-card__left-side-wraper-->
      </div><!--description-object-->
      <div class="open-card__right-side-outline">
      <div class="open-card__right-side">
        <div class="open-card__map"><div id="mini-map-${obj.id}"></div></div><!--open-card__map-->
        <div class="open-card__controller" value="${obj.percentage}">
          <div class="open-card__progress-block">
            <div class="js-open-card__progress" id="open-card-progress-${obj.id}" value="${obj.percentage}"></div>
          </div>
          <div class="length-of-road  add-line">
            <div class="length hide-for-desktop">${obj.percentage}%</div>
            <div class="length-description description-done">
              
                ${obj.labels.status} ${obj.done_date}
            </div>
          </div>
          <div class="length-of-road">
            <div class="length">${obj.length_km} <sub>Km</sub></div>
            <div class="length-description description-length">${obj.labels.road_length_km}</div>
          </div>

        </div><!--open-card__controller-->
      </div><!--open-card__right-side-->
      <div class="right-side__legend">
        <h5 class="legend">${obj.labels.legend}</h5>
        <div class="legend-group">
            <div class="lenend-group-wrapper">
                <div class="legend-group-img gray">
                    <div class="vertical-line"></div>
                    <div class="legend-small-circule"></div>
                    <div class="legend-big-circule"></div>
                </div>
                <div class="legend-text legend-text-1">
                    ${obj.labels.road_length_km}
                </div>
            </div>
            <div class="lenend-group-wrapper">
                <div class="legend-group-img dark-green">
                    <div class="vertical-line"></div>
                    <div class="legend-small-circule"></div>
                    <div class="legend-big-circule"></div>
                </div>
                <div class="legend-text legend-text-2">
                    ${obj.labels.top_layout}
                </div>
            </div>
            <div class="lenend-group-wrapper">
                <div class="legend-group-img light-green">
                    <div class="vertical-line"></div>
                    <div class="legend-small-circule"></div>
                    <div class="legend-big-circule"></div>
                </div>
                <div class="legend-text legend-text-3">
                    ${obj.labels.down_layout}
                </div>
            </div>
            <div class="lenend-group-wrapper">
                <div class="legend-group-img orange">
                    <div class="vertical-line"></div>
                    <div class="legend-small-circule"></div>
                    <div class="legend-big-circule"></div>
                </div>
                <div class="legend-text legend-text-4">
                    ${obj.labels.schedule}
                </div>
            </div>
        </div>
      </div>
      </div>
      <div class="open-card__phone-extra">
        <div class="phone-button">
          <a class="report-button" href="${obj.gallery_url}">${obj.labels.photos}</a>
        </div>
        <div class="phone-button">
          <a href="${obj.detail_url}" class="report-button">${obj.labels.go_object}</a>
        </div>
        <a class="open-card__phone-share">
          <div class="share-text">${obj.labels.links}</div>
          <i>
            <svg class="icon-share" width="33px" height="29px">
              <use href="#icon-share"></use>
            </svg>
          </i>
        </a>
      </div><!--open-card__phone-extra-->
    </div>
    `
}
// end шаблон інфо вікна на маркері

function progressBarDetail(selector) {
    $.each($(selector), function (index, value) {

        // get procent for circle
        const procent = +$(this).attr('value');

        const bar = new ProgressBar.Circle(value, {
            color: '#FFEA82',
            trailColor: '#979797',
            trailWidth: 1,
            duration: 1400,
            easing: 'easeInOut',
            strokeWidth: 6,
            text: {
                autoStyleContainer: false
            },
            step: function (state, circle) {

                let value = Math.round(circle.value() * 100);

                if (value === 0) {
                    circle.setText('');
                }
                else {
                    circle.setText(value + '%');
                }

                // added color for every category of percentages
                if (value < 25) {
                    circle.path.setAttribute('stroke', '#f8061d');
                }
                else if (value > 25 && value < 50) {
                    circle.path.setAttribute('stroke', '#ff6800');
                }
                else {
                    circle.path.setAttribute('stroke', '#50e3c2');
                }
            }
        });

        /**
         * here should be something like this
         * here I put perenteges and  / it to 100
         * */

        bar.animate(procent / 100);
        bar.text.style.color = '#010e40';
        bar.text.style.fontSize = '18px';
        bar.text.style.fontWeight = 'bold';

    });

    let progress = $('.open-card__controller').attr('value');

    if (progress == '0') {
        // added circle dpne for circle
        $('.js-open-card__progress').html('<svg width="62" height="62" id="Шар_1" data-name="Шар 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.6 47.6"><defs><style>.cls-1a{fill:#ff6800;}.cls-2a{fill:#fdad79;}</style></defs><title>icons for hotelprogr2</title><polygon class="cls-1a" points="23.8 25.5 26.8 28.8 26.8 30.6 20.9 30.6 20.9 28.8 23.8 25.5"/><polygon class="cls-1a" points="23.8 20.2 21.5 17.7 26.1 17.7 23.8 20.2"/><path class="cls-2a" d="M23.8,47.6A23.8,23.8,0,1,1,47.6,23.8,23.83,23.83,0,0,1,23.8,47.6ZM23.8,2A21.8,21.8,0,1,0,45.6,23.8,21.83,21.83,0,0,0,23.8,2Z"/><path class="cls-2a" d="M30.5,34.6H17.1V27l3.51-4.25L17.1,18.45V11H30.5v7.45l-3.42,4.34,3.42,4.26Zm-11.4-2h9.4V27.75l-4-4.94,4-5.06V13H19.1v4.75l4.09,5.06-4.09,5Z"/><path class="cls-1a" d="M31.8,34.6H15.9a1,1,0,1,1,0-2H31.8a1,1,0,0,1,0,2Z"/><path class="cls-1a" d="M31.8,13H15.9a1,1,0,1,1,0-2H31.8a1,1,0,0,1,0,2Z"/></svg>')
    } else if (progress == '100') {
        $('.js-open-card__progress').html('<svg class="done-icon" version="1.1" fill-opacity="0" width="62" height="62"><use xlink:href="#icon-complete-icon"></use><svg id="icon-complete-icon" viewBox="0 0 53 53" width="100%" height="100%"><title>complete-icon</title><g transform="translate(-9 -9)" stroke="#50E3C2" stroke-width="3" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><circle transform="rotate(-138 35.5 35.5)" cx="35.5" cy="35.5" r="24.5"></circle><path d="M46.517 27.483L32.055 43.517 25.517 37.5"></path></g></svg></svg>');
    } else {
        //call progress bar for pup-up element

    }


    // Добавляю заглушку для (road name)
    let $roadName = $('.open-card__icon');
    if ($roadName.text() === ''){
        $roadName.html(` <svg version="1.1" id="Шар_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 35 35" style="enable-background:new 0 0 35 35; height: 37px;margin-top: -3px;" xml:space="preserve"><style type="text/css">.st311 {fill: none;stroke: #FFFFFF;stroke-width: 2;stroke-linecap: round;stroke-linejoin: round;stroke-miterlimit: 10;}</style><g><polygon class="st311" points="25.4,24.9 8.8,24.9 12.1,6.7 22.1,6.7 	"/><line class="st311" x1="17.1" y1="13.6" x2="17.1" y2="17.4"/><line class="st311" x1="17.1" y1="6.8" x2="17.1" y2="9.3"/><line class="st311" x1="17.1" y1="21" x2="17.1" y2="24.9"/></g></svg>`)
    }

}

function popUp () {
    $('.open-card__phone-share').click(function (event) {
        event.preventDefault();
        $('.overlay-object').fadeIn(400,
            function () {
                $('.modal-object')
                    .css('display', 'block')
                    .animate({opacity: 1, top: '50%'}, 200);
            });

        /**
         *
         * - Get data from big opent-card and fill it to pop-up small card
         * - In case procent I chose a svg element
         * - In case procent I chose gradient
         *
         * */
            // get data and put it in pop-up // I didn't find another way
        const $openCard = $(this).closest($('.open-card')),
            $smallCard = $('.modal-object'),
            $cardObject = $('.card__object');

        // background image for popup


        const dataFromBigCard = {
            $icon: $openCard.find('.open-card__icon').html(),
            $locationCity: $openCard.find('.js-open-card__city')[0].textContent,
            $typeOfRepair: $openCard.find('.type-of-repair').text(),
            $urlImg: $openCard.attr('value'),
            $date: $openCard.find('.done-date').text(),
            $progress: $openCard.find('.open-card__controller').attr('value'), //$openCard.find('.js-open-card__progress')[0] ? $openCard.find('.js-open-card__progress')[0].textContent.slice(0, -1) : '100'
            $iconRepair: $openCard.find('.type-of-repair').attr('data-type-repair'),
        };

        // if admin doesn't load img for card background put cover
        if(dataFromBigCard.$urlImg === 'false' || dataFromBigCard.$urlImg === 'null' || dataFromBigCard.$urlImg === 'undefined' || dataFromBigCard.$urlImg === '') {
            if (+dataFromBigCard.$progress === 0) {
                dataFromBigCard.$urlImg = '/static/images/our-objects/road-done/0.jpg'
            } else if(+dataFromBigCard.$progress < 25 && +dataFromBigCard.$progress !== 0){
                dataFromBigCard.$urlImg = '/static/images/our-objects/road-done/25.jpg'
            } else if(+dataFromBigCard.$progress > 25 && +dataFromBigCard.$progress < 50) {
                dataFromBigCard.$urlImg = '/static/images/our-objects/road-done/50.jpg'
            } else if(+dataFromBigCard.$progress >= 50 && +dataFromBigCard.$progress < 100){
                dataFromBigCard.$urlImg = '/static/images/our-objects/road-done/50-100.jpg'
            } else if (+dataFromBigCard.$progress === 100) {
                dataFromBigCard.$urlImg = '/static/images/our-objects/road-done/100.jpg'
            } else {
                dataFromBigCard.$urlImg = '/static/images/our-objects/road-done/50.jpg'
            }
        }

        // get all elements
        let dataToSmallCard = {
            $icon: $smallCard.find('.location-card__road-number'),
            $locationCity: $smallCard.find('.location-card__city'),
            $typeOfRepair: $smallCard.find('.repair__value'),
            $date: $smallCard.find('.ready-highway__info'),
            $urlImg: $smallCard.find('.card__img'),
            $progress: $smallCard.find('#svg-circle-pop-up'),
            $iconRepair: $smallCard.find('.repair__icon').find('svg')
        };




        // set each element data
        dataToSmallCard.$icon.html(dataFromBigCard.$icon);
        dataToSmallCard.$locationCity.text(dataFromBigCard.$locationCity);
        dataToSmallCard.$typeOfRepair.text(dataFromBigCard.$typeOfRepair);
        dataToSmallCard.$urlImg.css('background-image', 'url(' + dataFromBigCard.$urlImg + ')');
        dataToSmallCard.$progress.attr('value', dataFromBigCard.$progress);
        dataToSmallCard.$date.text('Готовність на '+ dataFromBigCard.$date);
        dataToSmallCard.$iconRepair.html(`<svg class="done-icon" version="1.1"><use xlink:href="${dataFromBigCard.$iconRepair}"></use></svg>`)



        let cardID = $openCard.data('id')
        /* share id add to link */
        $smallCard.find('.reference-item-facebook').attr('data-url',`http://pbs.bukovel.ua/road-${ cardID }`);
        $smallCard.find('.reference-item-messanger').attr('href',`fb-messenger://share/?link=http://pbs.bukovel.ua/road-${ cardID }`);
        $smallCard.find('.reference-item-whatsapp').attr('href',`whatsapp://send?text=http://pbs.bukovel.ua/road-${ cardID }`);
        $smallCard.find('.reference-item-googleplus').attr('data-url',`http://pbs.bukovel.ua/road-${ cardID }`);
        $smallCard.find('.reference-item-twitter').attr('data-url',`http://pbs.bukovel.ua/road-${ cardID }`);



        // kill svg from container. Its instead of destroy progressbar
        dataToSmallCard.$progress.empty();

        if (dataFromBigCard.$progress == '0') {
            // added circle dpne for circle
            dataToSmallCard.$progress.append('<svg width="49" height="49" id="Шар_1" data-name="Шар 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47.6 47.6"><defs><style>.cls-1a{fill:#ff6800;}.cls-2a{fill:#fdad79;}</style></defs><title>icons for hotelprogr2</title><polygon class="cls-1a" points="23.8 25.5 26.8 28.8 26.8 30.6 20.9 30.6 20.9 28.8 23.8 25.5"/><polygon class="cls-1a" points="23.8 20.2 21.5 17.7 26.1 17.7 23.8 20.2"/><path class="cls-2a" d="M23.8,47.6A23.8,23.8,0,1,1,47.6,23.8,23.83,23.83,0,0,1,23.8,47.6ZM23.8,2A21.8,21.8,0,1,0,45.6,23.8,21.83,21.83,0,0,0,23.8,2Z"/><path class="cls-2a" d="M30.5,34.6H17.1V27l3.51-4.25L17.1,18.45V11H30.5v7.45l-3.42,4.34,3.42,4.26Zm-11.4-2h9.4V27.75l-4-4.94,4-5.06V13H19.1v4.75l4.09,5.06-4.09,5Z"/><path class="cls-1a" d="M31.8,34.6H15.9a1,1,0,1,1,0-2H31.8a1,1,0,0,1,0,2Z"/><path class="cls-1a" d="M31.8,13H15.9a1,1,0,1,1,0-2H31.8a1,1,0,0,1,0,2Z"/></svg>')
        } else if (dataFromBigCard.$progress == '100') {

            dataToSmallCard.$progress.append('<svg class="done-icon" version="1.1" fill-opacity="0" width="49" height="49"><use xlink:href="#icon-complete-icon"></use> </svg>');
        } else {
            //call progress bar for pup-up element
            progresBarForPopUp();
        }




        function removeClass() {
            $cardObject.removeClass('red-gradient').removeClass('orange-gradient').removeClass('orange-gradient');
        }

        removeClass();

        // added gradient for card //
        if (dataFromBigCard.$progress < 25) {
            //add red gradient
            $cardObject.addClass('red-gradient');

        }
        else if (dataFromBigCard.$progress > 25 && dataFromBigCard.$progress < 50) {
            // add orenge gradient
            $cardObject.addClass('orange-gradient');
        }
        else {
            // add grenn- gradient
            $cardObject.addClass('green-gradient');
        }
    });

    $('.modal-close-object, .overlay').click(function () {
        $('.modal-object')
            .animate({opacity: 0, top: '50%'}, 200,
                function () {
                    $(this).css('display', 'none');
                    $('.overlay-object').fadeOut(400);
                }
            );
    });

}

function progresBarForPopUp () {
    const idElement = $('#svg-circle-pop-up'),
        element = document.getElementById('svg-circle-pop-up');

    if (element) {

        let bar = new ProgressBar.Circle(element, {
            color: '#FFEA82',
            trailColor: '#979797',
            trailWidth: 1,
            duration: 1400,
            easing: 'easeInOut',
            strokeWidth: 6,
            text: {
                autoStyleContainer: false
            },
            step: function (state, circle) {

                let value = Math.round(circle.value() * 100);

                if (value === 0) {
                    circle.setText('');
                }
                else {
                    circle.setText(value + '%');
                }

                // added color for every category of percentages
                if (value < 25) {
                    circle.path.setAttribute('stroke', '#f8061d');
                }
                else if (value > 25 && value < 50) {
                    circle.path.setAttribute('stroke', '#ff6800');
                }
                else {
                    circle.path.setAttribute('stroke', '#50e3c2');
                }
            }
        });
        // here I put percenteges and  / it to 100
        bar.animate(+idElement.attr('value') / 100);//ourObjectsList[index].percentages / 100
        bar.text.style.color = '#010e40';
        bar.text.style.fontSize = '16px';
        bar.text.style.fontWeight = 'bold';
    }
}



function create_marker(gmap, position) {
    return new google.maps.Marker({
        position: position || null,
        map: gmap
    });
}

function gmap_style() {
    return [
        {
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#E2E7EB"
                }
            ]
        },
        {
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#616161"
                }
            ]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [
                {
                    "color": "#f5f5f5"
                }
            ]
        },
        {
            "featureType": "administrative.land_parcel",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#bdbdbd"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#eeeeee"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#757575"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#e5e5e5"
                }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#9e9e9e"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "road.arterial",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#757575"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#ffffff"
                }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#616161"
                }
            ]
        },
        {
            "featureType": "road.local",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#9e9e9e"
                }
            ]
        },
        {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#e5e5e5"
                }
            ]
        },
        {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#eeeeee"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
                {
                    "color": "#c9c9c9"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
                {
                    "color": "#9e9e9e"
                }
            ]
        }
    ]
}
