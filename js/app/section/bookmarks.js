// <BookmarkChart /> to be added

"use strict";

var React = require('react'),
    _ = require('lodash'),
    LoadJSON = require('./../utils/mixins').LoadJSON,
    PureRenderMixin = require('react-addons-pure-render-mixin'),
    TimeAgo = require('react-timeago').default,
    Debounce = require('react-throttle').Debounce,
    LineChart = require("react-chartjs").Line;

var FaPaperList = require('react-icons/lib/fa/list'),
    FaPaperTh = require('react-icons/lib/fa/th'),
    FaChRight = require('react-icons/lib/fa/chevron-right'),
    FaQuestion = require('react-icons/lib/fa/question');

var config = require('./../config/env.json')[process.env.NODE_ENV || 'development'],
    configObj = {
      searchHeader: {
          "Accept" : "application/json; charset=utf-8",
          "Content-Type": "application/javascript; charset=utf-8",
          "Access-Control-Allow-Origin" : "*"
        },
      searchTimeout: 5000,
      debounceTime: "400",
      shareLimit: 10,
      increaseLimit: 10,
      fontAwesomeSize: "18",
      articleBuildService: "https://medium.com/@bryanyuan2/how-to-build-my-bookmark-service-a77a97ae31a1#.wkhyixki0"
    },
    INSTAPAPER_LIST_API = config.INSTAPAPER.TYPE + "://" +
              config.INSTAPAPER.DOMAIN + ":" +
              config.INSTAPAPER.PORT + "/" +
              config.INSTAPAPER.PATH,
    INSTAPAPER_QUERY_API = config.INSTAPAPER.TYPE + "://" +
              config.INSTAPAPER.DOMAIN + ":" +
              config.INSTAPAPER.PORT + "/" +
              config.INSTAPAPER.SEARCH + "/",
    INSTAPAPER_COUNT_API = config.INSTAPAPER.TYPE + "://" +
              config.INSTAPAPER.DOMAIN + ":" +
              config.INSTAPAPER.PORT + "/" +
              config.INSTAPAPER.COUNT + "/",
    INSTAPAPER_LATEST_API = config.INSTAPAPER.TYPE + "://" +
              config.INSTAPAPER.DOMAIN + ":" +
              config.INSTAPAPER.PORT + "/" +
              config.INSTAPAPER.LATEST + "/",
    INSTAPAPER_TIMESTAMP_API = config.INSTAPAPER.TYPE + "://" +
              config.INSTAPAPER.DOMAIN + ":" +
              config.INSTAPAPER.PORT + "/" +
              config.INSTAPAPER.TIMESTAMP + "/",
    transObj = {
      added: 'added',
      articleBuildService: 'How I build this service ?',
      backToGithub: "Back to bryanyuan2 Github Page",
      list: "list",
      loading: "Loading bookmarks ...",
      moreBookmarksEtc: "more bookmarks ...",
      searchBoxPlaceHolder: "Search bookmarks here ...",
      simple: "simple",
      techHint: "This is my bookmarks index which is powered by Instapaper API, MondgoDB, Expressjs and ReactJS. Please feel free and grab some articles if you like it.",
      totalBookmarks: "Total bookmarks",
      zrp: "No bookmarks found ! please try other query"
    };


var SearchBox = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    updateShared: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      input: ''
    };
  },
  updateShared: function(query){
    this.props.updateShared(query);
  },
  componentWillUpdate: function(nextProps, nextState) {
    // console.log("componentWillUpdate nextState.input", nextState.input);
    this.updateShared(nextState.input);
  },
  handleChange: function(e) {
    var query = e.target.value ? e.target.value : '';
    this.setState({
      input: query
    });
  },
  render: function() {
     return (
        <div className="search-group">
          <Debounce time={configObj.debounceTime} handler="onChange">
            <input className="search-box" type="text" name="search" onChange={this.handleChange.bind(this)} placeholder={transObj.searchBoxPlaceHolder} />
          </Debounce>
        </div>
    );
  }
});


var ZRP = React.createClass({
  mixins: [PureRenderMixin],
  render: function() {
    return (
        <span className="search-item zrp">
          {transObj.zrp}
        </span>
    );
  }
});

var Tag = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    text: React.PropTypes.string,
    key: React.PropTypes.number
  },
  getDefaultProps: function() {
    return {
      text: '',
      key: 0
    };
  },
  render: function() {
    return (
        <span className="tag">{this.props.text}</span>
    );
  }
});

var Bookmark = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    item: React.PropTypes.object,
    key: React.PropTypes.number
  },
  getDefaultProps: function() {
    return {
      item: {},
      key: 0
    };
  },
  render: function() {
    // console.log("item", this.props.item);
    var tagsContent = [],
        data = {
          title: _.get(this.props, ['item', 'title'], ''),
          url: _.get(this.props, ['item', 'url'], ''),
          favicon: _.get(this.props, ['item', 'favicon'], ''),
          text: _.get(this.props, ['item', 'text'], ''),
          time: _.get(this.props, ['item', 'time'], ''),
          _description: _.get(this.props, ['item', '_description'], ''),
          _text: _.get(this.props, ['item', '_text'], ''),
          _image: _.get(this.props, ['item', '_image'], ''),
          _tags: _.get(this.props, ['item', '_tags'], []),
        },
        getCurrTime = new Date(data.time*1000),
        leftCls = data._image ? 'left' : 'left-clean';

    if (data._tags.length > 0) {
      data._tags.forEach(function(tag, index) {
        if (index < 3) {
          tagsContent.push(<Tag text={tag} key={index} />);
        }
      });
    }

    return (
      <div id={this.props.item.bookmark_id} className="search-item">
        <div className={leftCls}>
          <span className="titleCont">
            <a target="_blank" href={data.url}>
              <span className="favicon" >{ data.favicon && <img width="16" height="16" src={data.favicon} /> }</span>
              <span className="title">{data.title && data.title}</span>
            </a>
          </span>
          <div className="description">
            {
              (data._description && data._description) ||
              (data._text && data._text)
            }
          </div>
            {tagsContent}
            <div className="date">{transObj.added} <TimeAgo date={getCurrTime} /></div>
        </div>

        { data._image &&
          <div className="right">
              <div className="img">
                <img width="80" height="80" src={data._image} />
              </div>
          </div> }
      </div>
    );
  }
});


var BookmarkSimple = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    item: React.PropTypes.object,
    key: React.PropTypes.number
  },
  getDefaultProps: function() {
    return {
      item: {},
      key: 0
    };
  },
  render: function() {
    // console.log("item", this.props.item);
    var tagsContent = [],
        data = {
          title: _.get(this.props, ['item', 'title'], ''),
          url: _.get(this.props, ['item', 'url'], ''),
          favicon: _.get(this.props, ['item', 'favicon'], ''),
          text: _.get(this.props, ['item', 'text'], ''),
          time: _.get(this.props, ['item', 'time'], ''),
          _description: _.get(this.props, ['item', '_description'], ''),
          _text: _.get(this.props, ['item', '_text'], ''),
          _image: _.get(this.props, ['item', '_image'], ''),
          _tags: _.get(this.props, ['item', '_tags'], []),
        },
        getCurrTime = new Date(data.time*1000),
        leftCls = data._image ? 'left' : 'left-clean';

    if (data._tags.length > 0) {
      data._tags.forEach(function(tag, index) {
        if (index < 3) {
          tagsContent.push(<Tag text={tag} key={index} />);
        }
      });
    }

    return (
      <div id={this.props.item.bookmark_id} className="search-item-simple">
        <div className={leftCls}>
          <li>
            <a target="_blank" href={data.url}>
              <span className="title">{data.title && data.title}</span>
            </a>
          </li>
        </div>
      </div>
    );
  }
});


var BookmarkStatusCount = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState: function() {
    return {
      count: 0
    };
  },
  componentWillMount: function() {
    var that = this;
    $.ajax({
      type: 'GET',
      url: INSTAPAPER_COUNT_API,
      contentType: "application/json",
      headers: configObj.searchHeader,
      timeout: configObj.searchTimeout
    }).done(function( data ) {
      var output = $.parseJSON(data);
      that.setState({
        count: output[0].count
      });
    });
  },
  render: function() {
    var count = this.state.count;
    return (
        <div className="bookmarksInfo">
          <div>
            <span className="hint-count">{transObj.totalBookmarks}: </span>
            <span className="count">{count}</span>
          </div>
        </div>
    );
  }
});


var BookmarkStatusUpdate = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState: function() {
    return {
      time: 0
    };
  },
  componentWillMount: function() {
    var that = this;
    $.ajax({
      type: 'GET',
      url: INSTAPAPER_LATEST_API,
      contentType: "application/json",
      headers: configObj.searchHeader,
      timeout: configObj.searchTimeout
    }).done(function( data ) {
      that.setState({
        time: data[0].time
      });
    });
  },
  render: function() {
    var time = this.state.time,
        getCurrTime = new Date(time*1000);

    return (
        <div className="bookmarksInfo">
          <div>
            <span className="hint-count">Latest update: </span>
            <span className="count">
              <TimeAgo date={getCurrTime} />
            </span>
          </div>
        </div>
    );
  }
});

var BookmarksSync = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    shareLimit: React.PropTypes.func,
    shareType: React.PropTypes.func,
    sharedQuery: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      load: false,
      type: 'default',
      data: {}
    };
  },
  getDefaultProps: function() {
      return {
          sharedQuery: '',
          shareType: 'default',
          shareLimit: configObj.shareLimit
      };
  },
  updateShared: function(){
    // this.props.updateShared();
  },
  componentWillMount: function() {
    // console.log("this.props.sharedQuery", this.props.sharedQuery);
    var that = this;
    $.ajax({
      type: 'GET',
      url: INSTAPAPER_LIST_API,
      contentType: "application/json",
      headers: configObj.searchHeader,
      timeout: configObj.searchTimeout
    }).done(function( data ) {
      that.setState({
        load: true,
        data: data
      });
    });
  },
  componentWillReceiveProps: function(nextProps) {

    // console.log("componentWillUpdate sharedQuery", nextProps.sharedQuery);
    if (this.props.shareType === nextProps.shareType) {
        var that = this,
            api;

        if (nextProps.sharedQuery) {
          api = INSTAPAPER_QUERY_API + nextProps.sharedQuery + '/' + nextProps.shareLimit;
        } else {
          api = INSTAPAPER_LIST_API + '/' + nextProps.shareLimit;
        }

        $.ajax({
          type: 'GET',
          url: api,
          contentType: "application/json",
          headers: configObj.searchHeader,
          timeout: configObj.searchTimeout
        }).done(function( data ) {
          that.setState({
            load: true,
            data: data
          });
        });
    }
  },
  render: function() {
    var targetData = this.state.data,
        bookmark,
        bookmarksCls;

    if (this.state.load === true) {
      bookmark = [];
      bookmarksCls = "bookmarks";

      if (targetData.result !== "0" && targetData.result !== "error") {
        if (this.props.shareType === 'default') {  
            targetData.forEach(function(item, index) {
              bookmark.push(<Bookmark item={item} key={index} />);
            });
        } else if (this.props.shareType === 'simple') {
            targetData.forEach(function(item, index) {
              bookmark.push(<BookmarkSimple item={item} key={index} />);
            });
        }
      } else {
        bookmark.push(<ZRP />);
      }
    
    } else {
      bookmark = transObj.loading;
      bookmarksCls = "bookmarks loading";
    }

    return (
        <div>
          <div className="bookmarks-hint">{transObj.techHint}</div>
          <a target="_blank" href={configObj.articleBuildService} className="btn btn-default navbar-btn"><FaQuestion size={configObj.fontAwesomeSize} />{transObj.articleBuildService}</a>
          <div className={bookmarksCls}>
            {bookmark}
          </div>
        </div>
      );
  }
});

var DisplaySelect = React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    updateSelect: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      type: 'default'
    };
  },
  getDefaultProps: function() {
      return {
      };
  },
  updateSelect: function(type){
    this.props.updateSelect(type);
  },
  componentWillUpdate: function(nextProps, nextState) {
    this.updateSelect(nextState.type);
  },
  _handleClick: function(e) {
    if (e.currentTarget.id === 'display-default') {
      this.setState({ type: 'default' });
    } else if (e.currentTarget.id === 'display-simple') {
      this.setState({ type: 'simple' });
    }
  },
  render: function() {
    return (
        <div className="display-group">
          <button id="display-default" className="btn btn-default  display-group-btn" type="submit" onClick={this._handleClick.bind(this)}><FaPaperTh size={configObj.fontAwesomeSize} /> {transObj.list}</button>
          <button id="display-simple" className="btn btn-default display-group-btn" type="submit" onClick={this._handleClick.bind(this)}><FaPaperList size={configObj.fontAwesomeSize} /> {transObj.simple}</button>
        </div>
      );
  }
});

var MoreLink = React.createClass({
  moreLinkLimit: configObj.shareLimit,
  mixins: [PureRenderMixin],
  propTypes: {
    updateLimit: React.PropTypes.func
  },
  getInitialState: function() {
    return {
        limit: configObj.shareLimit
    };
  },
  getDefaultProps: function() {
      return {
      };
  },
  updateLimit: function(limit){
    // console.log("MoreLink updateLimit");
    this.props.updateLimit(limit);
  },
  _handleNextPage: function() {
      this.moreLinkLimit = this.moreLinkLimit + configObj.increaseLimit;
      this.setState({
          limit: this.moreLinkLimit
      });
      this.updateLimit(this.moreLinkLimit);
  },
  render: function() {
    return (
        <div className="more-link-group">
          <button id="more-link-btn" className="btn btn-default display-group-btn" type="submit" onClick={this._handleNextPage.bind(this)} ><FaChRight size={configObj.fontAwesomeSize} /> {transObj.moreBookmarksEtc}</button>
        </div>
      );
  }
});

var BookmarksContainer = React.createClass({
  mixins: [LoadJSON],
  getInitialState: function() {
    return {
      sharedQuery: '',
      shareType: 'default',
      shareLimit: configObj.shareLimit
    };
  },
  updateShared: function(sharedQuery){
    this.setState({
      sharedQuery: sharedQuery
    });
  },
  updateLimit: function(shareLimit){
    // console.log("updateLimit", shareLimit);
    this.setState({
      shareLimit: shareLimit
    });
  },  
  updateSelect: function(shareType){
    this.setState({
      shareType: shareType
    });
  },
  render: function() {
    return(
      <div>
        <div className="bookmark-header-cont">
          <SearchBox updateShared={this.updateShared} />
          <DisplaySelect updateSelect={this.updateSelect} />  
          <div className="bookmarks-alert alert alert-success" role="alert">
            <BookmarkStatusCount />
            <BookmarkStatusUpdate />
          </div>
        </div>
        <BookmarksSync shareLimit={this.state.shareLimit} shareType={this.state.shareType} sharedQuery={this.state.sharedQuery} />
        <div id="back-to-nav">
          <a target="_blank" href="http://bryanyuan2.github.io">
            <img className="github-img" src="asserts/images/tech/github.png" alt={transObj.backToGithub} />
            <div className="github-text">{transObj.backToGithub}</div>
          </a>
        </div>
        <hr />
        <MoreLink updateLimit={this.updateLimit} />
      </div>
    );
  }
});

/*
var BookmarkChart = React.createClass({
  propTypes: {
  },
  getInitialState: function() {
    return {
      load: true,
      data: {}
    };
  },
  getDefaultProps: function() {
      return {
      };
  },
  componentWillMount: function() {
    var that = this;
    $.ajax({
      type: 'GET',
      url: INSTAPAPER_TIMESTAMP_API,
      contentType: "application/json",
      headers: configObj.searchHeader,
      timeout: configObj.searchTimeout
    }).done(function( data ) {
      that.setState({
        load: true,
        data: data
      });
    });
  },
  render: function() {

    var chartData = {
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July"
      ],
      datasets: [
        {
          label: "My First dataset",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: [65, 59, 80, 81, 56, 55, 40],
            spanGaps: false,
        }
      ]
    };

    var chartOptions = {
        datasetFill: false,
        responsive: true,
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom'
            }]
        }
    };

    return (
        <div>
          <LineChart data={chartData} options={chartOptions} width="800" height="180"/>
        </div>
      );
  }
});
*/

module.exports = BookmarksContainer;
