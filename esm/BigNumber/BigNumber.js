import _pt from "prop-types";

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import shortid from 'shortid';
import { t, getNumberFormatter, smartDateVerboseFormatter, computeMaxFontSize, BRAND_COLOR, styled } from '@superset-ui/core';
import { XYChart, AreaSeries, CrossHair, LinearGradient } from '@data-ui/xy-chart';
const defaultNumberFormatter = getNumberFormatter();
const CHART_MARGIN = {
  top: 4,
  right: 4,
  bottom: 4,
  left: 4
};
const PROPORTION = {
  // text size: proportion of the chart container sans trendline
  HEADER: 0.3,
  SUBHEADER: 0.125,
  // trendline size: proportion of the whole chart container
  TRENDLINE: 0.3
};
export function renderTooltipFactory(formatDate = smartDateVerboseFormatter, formatValue = defaultNumberFormatter) {
  return function renderTooltip({
    datum: {
      x,
      y
    }
  }) {
    // even though `formatDate` supports timestamp as numbers, we need
    // `new Date` to pass type check
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 8px'
      }
    }, formatDate(new Date(x)), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, y === null ? t('N/A') : formatValue(y)));
  };
}

class BigNumberVis extends React.PureComponent {
  constructor(...args) {
    super(...args);
    this.gradientId = shortid.generate();
  }

  getClassName() {
    const {
      className,
      showTrendLine,
      bigNumberFallback
    } = this.props;
    const names = `superset-legacy-chart-big-number ${className} ${bigNumberFallback ? 'is-fallback-value' : ''}`;
    if (showTrendLine) return names;
    return `${names} no-trendline`;
  }

  createTemporaryContainer() {
    const container = document.createElement('div');
    container.className = this.getClassName();
    container.style.position = 'absolute'; // so it won't disrupt page layout

    container.style.opacity = '0'; // and not visible

    return container;
  }

  renderFallbackWarning() {
    const {
      bigNumberFallback,
      formatTime
    } = this.props;
    if (!bigNumberFallback) return null;
    return /*#__PURE__*/React.createElement("span", {
      className: "alert alert-warning",
      role: "alert",
      title: t(`Last available value seen on %s`, formatTime(bigNumberFallback.x))
    }, t('Not up to date'));
  }

  renderHeader(maxHeight) {
    const {
      bigNumber,
      formatNumber,
      width
    } = this.props;
    const text = bigNumber === null ? t('No data') : formatNumber(bigNumber);
    const container = this.createTemporaryContainer();
    document.body.append(container);
    const fontSize = computeMaxFontSize({
      text,
      maxWidth: width,
      maxHeight,
      className: 'header-line',
      container
    });
    container.remove();
    return /*#__PURE__*/React.createElement("div", {
      className: "header-line",
      style: {
        fontSize,
        height: maxHeight
      }
    }, text);
  }

  renderSubheader(maxHeight) {
    const {
      bigNumber,
      subheader,
      width,
      bigNumberFallback
    } = this.props;
    let fontSize = 0;
    const NO_DATA_OR_HASNT_LANDED = t('No data after filtering or data is NULL for the latest time record');
    const NO_DATA = t('Try applying different filters or ensuring your datasource has data');
    let text = subheader;

    if (bigNumber === null) {
      text = bigNumberFallback ? NO_DATA : NO_DATA_OR_HASNT_LANDED;
    }

    if (text) {
      const container = this.createTemporaryContainer();
      document.body.append(container);
      fontSize = computeMaxFontSize({
        text,
        maxWidth: width,
        maxHeight,
        className: 'subheader-line',
        container
      });
      container.remove();
      return /*#__PURE__*/React.createElement("div", {
        className: "subheader-line",
        style: {
          fontSize,
          height: maxHeight
        }
      }, text);
    }

    return null;
  }

  renderTrendline(maxHeight) {
    const {
      width,
      trendLineData,
      mainColor,
      subheader,
      startYAxisAtZero,
      formatNumber,
      formatTime,
      fromDatetime,
      timeRangeFixed
    } = this.props; // if can't find any non-null values, no point rendering the trendline

    if (!(trendLineData != null && trendLineData.some(d => d.y !== null))) {
      return null;
    } // Apply a fixed X range if a time range is specified.
    //
    // XYChart checks the existence of `domain` property and decide whether to
    // apply a domain or not, so it must not be `null` or `undefined`


    const xScale = {
      type: 'timeUtc'
    };
    const tooltipData = trendLineData && [...trendLineData];

    if (tooltipData && timeRangeFixed && fromDatetime) {
      var _this$props$toDatetim;

      const toDatetime = (_this$props$toDatetim = this.props.toDatetime) != null ? _this$props$toDatetim : Date.now();

      if (tooltipData[0].x > fromDatetime) {
        tooltipData.unshift({
          x: fromDatetime,
          y: null
        });
      }

      if (tooltipData[tooltipData.length - 1].x < toDatetime) {
        tooltipData.push({
          x: toDatetime,
          y: null
        });
      }

      xScale.domain = [fromDatetime, toDatetime];
    }

    return /*#__PURE__*/React.createElement(XYChart, {
      snapTooltipToDataX: true,
      ariaLabel: `Big number visualization ${subheader}`,
      renderTooltip: renderTooltipFactory(formatTime, formatNumber),
      xScale: xScale,
      yScale: {
        type: 'linear',
        includeZero: startYAxisAtZero
      },
      width: Math.floor(width),
      height: maxHeight,
      margin: CHART_MARGIN,
      eventTrigger: "container"
    }, /*#__PURE__*/React.createElement(LinearGradient, {
      id: this.gradientId,
      from: mainColor,
      to: "#fff"
    }), /*#__PURE__*/React.createElement(AreaSeries, {
      data: tooltipData,
      fill: `url(#${this.gradientId})`,
      stroke: mainColor
    }), /*#__PURE__*/React.createElement(CrossHair, {
      fullHeight: true,
      stroke: mainColor,
      circleFill: mainColor,
      circleStroke: "#fff",
      showHorizontalLine: false,
      strokeDasharray: "5,2"
    }));
  }

  render() {
    const {
      showTrendLine,
      height,
      headerFontSize,
      subheaderFontSize
    } = this.props;
    const className = this.getClassName();

    if (showTrendLine) {
      const chartHeight = Math.floor(PROPORTION.TRENDLINE * height);
      const allTextHeight = height - chartHeight;
      return /*#__PURE__*/React.createElement("div", {
        className: className
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-container",
        style: {
          height: allTextHeight
        }
      }, this.renderFallbackWarning(), this.renderHeader(Math.ceil(headerFontSize * (1 - PROPORTION.TRENDLINE) * height)), this.renderSubheader(Math.ceil(subheaderFontSize * (1 - PROPORTION.TRENDLINE) * height))), this.renderTrendline(chartHeight));
    }

    return /*#__PURE__*/React.createElement("div", {
      className: className,
      style: {
        height
      }
    }, this.renderHeader(Math.ceil(headerFontSize * height)), this.renderSubheader(Math.ceil(subheaderFontSize * height)));
  }

}

BigNumberVis.propTypes = {
  className: _pt.string,
  width: _pt.number.isRequired,
  height: _pt.number.isRequired,
  bigNumber: _pt.oneOfType([_pt.number, _pt.oneOf([null])]),
  bigNumberFallback: _pt.shape({
    x: _pt.number.isRequired,
    y: _pt.oneOfType([_pt.number, _pt.oneOf([null])])
  }),
  fromDatetime: _pt.number,
  toDatetime: _pt.number,
  headerFontSize: _pt.number,
  subheader: _pt.string,
  subheaderFontSize: _pt.number,
  showTrendLine: _pt.bool,
  startYAxisAtZero: _pt.bool,
  timeRangeFixed: _pt.bool,
  trendLineData: _pt.arrayOf(_pt.shape({
    x: _pt.number.isRequired,
    y: _pt.oneOfType([_pt.number, _pt.oneOf([null])])
  })),
  mainColor: _pt.string
};
BigNumberVis.defaultProps = {
  className: '',
  formatNumber: num => String(num),
  formatTime: smartDateVerboseFormatter.formatFunc,
  headerFontSize: PROPORTION.HEADER,
  mainColor: BRAND_COLOR,
  showTrendLine: false,
  startYAxisAtZero: true,
  subheader: '',
  subheaderFontSize: PROPORTION.SUBHEADER,
  timeRangeFixed: false
};
export default styled(BigNumberVis)`
  font-family: ${({
  theme
}) => theme.typography.families.sansSerif};
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &.no-trendline .subheader-line {
    padding-bottom: 0.3em;
  }

  .text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    .alert {
      font-size: ${({
  theme
}) => theme.typography.sizes.s};
      margin: -0.5em 0 0.4em;
      line-height: 1;
      padding: 2px 4px 3px;
      border-radius: 3px;
    }
  }

  .header-line {
    font-weight: ${({
  theme
}) => theme.typography.weights.normal};
    position: relative;
    line-height: 1em;
    span {
      position: absolute;
      bottom: 0;
    }
  }

  .subheader-line {
    font-weight: ${({
  theme
}) => theme.typography.weights.light};
    line-height: 1em;
    padding-bottom: 0;
  }

  &.is-fallback-value {
    .header-line,
    .subheader-line {
      opacity: 0.5;
    }
  }

  .superset-data-ui-tooltip {
    z-index: 1000;
    background: #000;
  }
`;