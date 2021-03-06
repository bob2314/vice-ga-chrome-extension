/*global chrome*/
import React, { Component } from 'react';
import './App.css';
import vice_tech_logo from './images/vicetech-square.svg';
import google_analytics_icon from './images/google_analytics_icon.png';
import segment_icon from './images/segment_icon.png';
import down_arrow from './images/down_arrow.png';
import right_arrow from './images/right_arrow.png';
import pop_window_icon from './images/pop_window_icon.png';
import {getGAConfig} from "./common/Utils";

class SegmentCustomDimensionContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          showMoreFlag: true
        };
    }
    showMoreToggle(){
      this.setState({
        showMoreFlag: (this.state.showMoreFlag)?false:true
      });
    }

    static renderCustomDimension(eventMetadata) {
         if (eventMetadata) {

               return Object.keys(eventMetadata).map((key) => {
                   let value = '';
                   let objectFlag = false;
                   if(typeof eventMetadata[key] === 'object' && eventMetadata[key] !== null){
                     value = JSON.stringify(eventMetadata[key]);
                     objectFlag = true;
                   }else{
                     value = eventMetadata[key];
                   }

                 // console.log(gaEvent[key]);
                 return (<SegmentCustomDimensionContainer cd={value} id={key} objectFlag={objectFlag} key={key} />);
               });
        }
         return '';
     }

    static cdValueParser(objectFlag, valueString){
      let cdValue = '';
        if(objectFlag){
      //    console.log(JSON.parse(this.props.cd))
          cdValue = JSON.parse(valueString);
        }else{
      //    console.log(this.props.cd);
          cdValue = valueString;
          if(cdValue == null){
            cdValue = '';
           }
          cdValue = cdValue.toString();
        }


      return cdValue;
    }
    static renderRouteParser(objectFlag, valueLengthLimit, cdValue){
      let route = 'short';
      if(objectFlag == false && cdValue.length <= valueLengthLimit){
        route = 'short';
      }
      if(objectFlag == false && cdValue.length > valueLengthLimit){
        route = 'long';
      }
      if(objectFlag == true){
        route = 'object';
      }
      return route;
    }


    render() {
      if(this.props.id){
        const cdKey = this.props.id;
        let cdValue = SegmentCustomDimensionContainer.cdValueParser(this.props.objectFlag, this.props.cd);
        const valueLengthLimit = 50;
      //  console.log(cdValue);
        let renderRoute = SegmentCustomDimensionContainer.renderRouteParser(this.props.objectFlag, valueLengthLimit, cdValue);
      //  console.log(renderRoute);

          return (
            // Three rendering paths.  1) just plan txt 2.) a show more / hide button 3.) Nested Object

              <div className='customDimensionsSection'>
                <div className='customDimensions'>

                  <span className={(renderRoute =='object')?'cdObjectLabel':'cdLabel'}> {cdKey}  </span> :
                  {(renderRoute == 'short') && <span className='cdValue'> {cdValue} </span>}
                  {(renderRoute == 'long' && this.state.showMoreFlag === true ) && <span onClick={()=>this.showMoreToggle()} className='showMore'>Show More</span>}
                  {(renderRoute == 'long'  && this.state.showMoreFlag === false ) &&
                  <span>
                    <span onClick={()=>this.showMoreToggle()} className='showMore'>Hide</span>
                    <div className='customDimensionLongText'>  {cdValue} </div>
                  </span>
                  }
                  {(renderRoute == 'object' && cdKey == 'Properties Object') && SegmentCustomDimensionContainer.renderCustomDimension(cdValue) }
                  {(renderRoute == 'object' && cdKey != 'Properties Object' && this.state.showMoreFlag === true) && <span onClick={()=>this.showMoreToggle()} className='showMore'>Show More</span>}
                  {(renderRoute == 'object' && cdKey != 'Properties Object' && this.state.showMoreFlag === false) &&
                    <span>
                      <span onClick={()=>this.showMoreToggle()} className='showMore'>Hide</span>
                      <div className='customDimensionLongText'>  {SegmentCustomDimensionContainer.renderCustomDimension(cdValue)} </div>
                    </span>
                  }


                </div>
              </div>
          );
      }
    }
}

class GACustomDimensionContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          showMoreFlag: true
        };
    }
    showMoreToggle(){
      this.setState({
        showMoreFlag: (this.state.showMoreFlag)?false:true
      });
    }

    render() {
      if(this.props.id){
        const cdKey = this.props.id;
        let cdValue = this.props.cd || '';
        cdValue = cdValue.toString();
        const valueLengthLimit = 50;
       // console.log(cdValue)
        //{(cdValue.length > 20)?"<span>Show</span>":cdValue}
          return (
              <div className='customDimensionsSection'>
              <div className='customDimensions'>
                <span className='cdLabel'>
                  {cdKey}
                </span> : <span className='cdValue'>
                  {(cdValue.length <= valueLengthLimit) && cdValue}
                </span>
                {(cdValue.length > valueLengthLimit && this.state.showMoreFlag) &&
                <span onClick={()=>this.showMoreToggle()} className='showMore'>Show More</span>
                }
                {(cdValue.length > valueLengthLimit && this.state.showMoreFlag === false ) &&
                <span>
                  <span onClick={()=>this.showMoreToggle()} className='showMore'>Hide</span>
                  <div className='customDimensionLongText'>  {cdValue} </div>
                </span>
                }
              </div>
              </div>
          );
      }
    }
}

class EventContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            class: 'customDimensionClose'
        };
    }
   // Handles The Show and Hide Status of the Custom Dimensions
    handleClick(){
      if(this.state.open) {
        this.setState({
          open: false,
          class: "customDimensionClose"
        });
      }else{
        this.setState({
          open: true,
          class: "customDimensionOpen"
        });
      }
    }
   static renderCustomDimension(pixelType, gaEvent) {
        if (gaEvent) {
          // Rendering Logic for Google Analytics Pixels
            if(pixelType === 'Google Analytics'){
              return Object.keys(gaEvent).map((key) => {
                 // const {url, requestDuration, status} = trackingIdLog[key];
                return (<GACustomDimensionContainer cd={gaEvent[key]} id={key} key={key} />);
              });
            }
           // Rendering Logic for Segment Pixels
            if(pixelType === 'Segment'){
              return Object.keys(gaEvent).map((key) => {
                  let value = '';
                  let objectFlag = false;
                  if(typeof gaEvent[key] === 'object' && gaEvent[key] !== null){

                    value = JSON.stringify(gaEvent[key]);
                    objectFlag = true;
                  }else{
                    value = gaEvent[key];
                  }

                // console.log(gaEvent[key]);
                return (<SegmentCustomDimensionContainer cd={value} id={key} objectFlag={objectFlag} key={key} />);
              });
            }

        }
        return '';
    }

   static gaCustomDimensionLabels(gaEvent, gaConfig, networkLabel){

     var configMap = {"cg" : "contentGroups", "cm" : "customMetrics", "cd" : "customDimensions"};
     var friendlyNameMap = {"cg" : "Content Group", "cm" : "Custom Metric", "cd" : "Custom Dimension"};

     var mappedLabel = configMap[networkLabel];
     var output = {};
     // Content Groups
     var label;
     for(var i in gaEvent){
       if(i.indexOf(networkLabel) > -1){
         if(gaConfig[gaEvent.tid]){ // Handling undefined Edge Cases
           if(gaConfig[gaEvent.tid][mappedLabel]){ // Handling undefined Edge Cases
               if(gaConfig[gaEvent.tid][mappedLabel][i]){
                  label = gaConfig[gaEvent.tid][mappedLabel][i] + " ("+i+")";
               }else {
                  label = i.replace(networkLabel,friendlyNameMap[networkLabel]+' ');
               }
          }
         }else{
              label = i.replace(networkLabel,friendlyNameMap[networkLabel]+' ');
         }
         output[label] = gaEvent[i]
      }
     }
     return output;


   }
   static gaCustomDimensions(gaEvent, gaConfig){
     if(gaEvent.tid){
       let output = {};
       // Standard Variables
        output = {
           'Tracking ID' : gaEvent.tid,
           'Client ID' : gaEvent.cid,
           'Title' : gaEvent.dt,
           'Location' : gaEvent.dl,
           'Page' : gaEvent.dp,
           'Hit Type' : gaEvent.t,
         };
        if (gaEvent.t === 'event'){
          output['Event Category'] = gaEvent.ec;
          output['Event Action'] = gaEvent.ea;
          output['Event Label'] = gaEvent.el;
          output['Event Value'] = gaEvent.ev;
          output['NonInteraction'] = gaEvent.ni;
       }
       Object.assign(output, EventContainer.gaCustomDimensionLabels(gaEvent, gaConfig, 'cg'));
       Object.assign(output, EventContainer.gaCustomDimensionLabels(gaEvent, gaConfig, 'cd'));
       Object.assign(output, EventContainer.gaCustomDimensionLabels(gaEvent, gaConfig, 'cm'));

       return output;
     } else{
       return '';
     }
   }

   static segmentCustomDimensions(eventMetadata){
     if(eventMetadata.writeKey){
       let output = {};
       // Standard Variables
        output = {
           'Write Key' : eventMetadata.writeKey,
           'Anonymous ID' : eventMetadata.anonymousId,
           'User ID' : eventMetadata.userId,
           'Title' : eventMetadata.context.page.title,
           'Location' : eventMetadata.context.page.url,
           'Page' : eventMetadata.context.page.path,
           'Hit Type' : eventMetadata.type,
         };
        if (eventMetadata.type === 'identify'){
          Object.assign(output, eventMetadata.traits);
        } else if (eventMetadata.type === 'page' || eventMetadata.type === 'track'){

          Object.assign(output, {'Integrations Object': eventMetadata.integrations});
          Object.assign(output, {'Context Object': eventMetadata.context});
          Object.assign(output, {'Properties Object': eventMetadata.properties});
        }
      //  console.log(output);
       return output;
     } else{
       return '';
     }
   }

   static populateCustomDimensions(pixelType, eventMetadata, gaConfig){
     var output;
     if(pixelType === 'Google Analytics'){
      output = EventContainer.gaCustomDimensions(eventMetadata, gaConfig);
    } else if (pixelType === 'Segment'){
      output = EventContainer.segmentCustomDimensions(eventMetadata);
    }
     return output;
   }
   static eventArrowRender(openStatus){
     var eventArrow;
     if(openStatus){
       eventArrow = (<img className='EventArrow' src={down_arrow} alt='down_arrow'/>);
     } else{
       eventArrow = (<img className='EventArrow' src={right_arrow} alt='right_arrow'/>);
     }
     return eventArrow;
   }

   static eventLabelRender(pixelType, eventMetadata){
     // Sets the Top Level Event and Page Label Next to the Arrow
     function deepFind(obj, path) {
       var paths = path.split('.')
         , current = obj
         , i;

       for (i = 0; i < paths.length; ++i) {
         if (current[paths[i]] === undefined) {
           return undefined;
         } else {
           current = current[paths[i]];
         }
       }
       return current;
     }

     function setEventVariable(pixelType, obj, gaVariable, segmentVariable){
       var output;
       if (pixelType === 'Google Analytics'){
           if(typeof gaVariable === 'undefined'){
             output ='undefined';
           } else{
             output = deepFind(obj,gaVariable);
           }
       } else if (pixelType === 'Segment'){
           if(typeof segmentVariable === 'undefined'){
             output ='undefined';
           } else{
             output = deepFind(obj,segmentVariable);
           }
      }
      return output;
     }
     function upperCaseFirstLetter(string){
          return string.charAt(0).toUpperCase() + string.slice(1);
      }

     var eventLabelOutput = {};
     var eventType = setEventVariable(pixelType, eventMetadata, 't', 'type');
     eventLabelOutput.hitType = upperCaseFirstLetter(eventType);
     //console.log(JSON.stringify(eventMetadata));
     //Rendering Event Label
         if(eventType ==='event' || eventType ==='track' ){
           var eventCategory =setEventVariable(pixelType, eventMetadata, 'ec', 'properties.category');
           var eventAction =setEventVariable(pixelType, eventMetadata, 'ea', 'event');
           var eventLabel =setEventVariable(pixelType, eventMetadata, 'el', 'properties.label');

           if(pixelType === 'Google Analytics'){
              // If the GA Event Label is the same as the Event Cateogry and Event Action (category | action), then display only Event Label
              if( eventLabel == eventCategory+' | '+eventAction ){
                eventLabelOutput.label =(
                              <span>
                                <span className= {`${ (eventLabel === 'undefined')?'statusAmber':''} `}> {`${eventLabel} `} </span>
                              </span>);
              } else{
               eventLabelOutput.label =(
                             <span>
                               <span className= {`${ (eventCategory === 'undefined')?'statusAmber':''} `}>: {`${eventCategory} `} </span>|
                               <span className= {`${ (eventAction === 'undefined')?'statusAmber':''} `}> {`${eventAction} `} </span>|
                               <span className= {`${ (eventLabel === 'undefined')?'statusAmber':''} `}> {`${eventLabel} `} </span>
                             </span>);
              }
           } else if (pixelType === 'Segment'){
             eventLabelOutput.label =(
                           <span>
                             <span className= {`${ (eventAction === 'undefined')?'statusAmber':''} `}> {`${eventAction} `} </span>
                           </span>);
           }

         } else {
           var pageTitle =setEventVariable(pixelType, eventMetadata, 'dt', 'context.page.title');
               eventLabelOutput.label = ' : '+ pageTitle;
         }

     return eventLabelOutput;

   }

    render() {
      const eventLabelLengthLimit = 50; //Add Length to Name
      const eventMetadata = this.props.trackingEvent.message.body;
      const pixelType = this.props.trackingEvent.pixelType;
      const structuredEventMetadata = EventContainer.populateCustomDimensions(pixelType, eventMetadata, this.props.gaConfig)

      var eventLabel = EventContainer.eventLabelRender(pixelType, eventMetadata);
      var eventArrow = EventContainer.eventArrowRender(this.state.open);

        return (
            <div>
                <div className='EventTitle'
                  onClick={() => this.handleClick()}>
                  {eventArrow}{eventLabel.hitType}&nbsp;
                  <span className={(this.props.trackingEvent.status === 'complete')?'':'statusRed'}>
                      ({this.props.trackingEvent.status})
                  </span>
                  {(eventLabel.label.length > eventLabelLengthLimit)?eventLabel.label.substring(0,eventLabelLengthLimit)+'...':eventLabel.label}
                </div>
            <div className={this.state.class}>{EventContainer.renderCustomDimension(pixelType, structuredEventMetadata)}</div>
            </div>
        );
    }
}

class TrackingIdContainer extends React.Component {

    static renderEvent(eventLog, gaConfig) {
        if (eventLog) {
            return Object.keys(eventLog).map((key) => {
              return (<EventContainer trackingEvent={eventLog[key]} id={key} key={key} gaConfig={gaConfig}/>);
            });
        }
        return '';
    }

    render() {
      const trackingId = this.props.id;
      const eventLog = this.props.eventLog;
      const pixelType = eventLog[Object.keys(eventLog)[0]].pixelType;

        return (
          <div>
            <div className='trackingHeader'>
              <div>
                <img className='trackingLogo' src={(pixelType ==='Google Analytics')?google_analytics_icon : segment_icon} alt={pixelType} />
              </div>
              <div>
                <div className='trackingLabel'>{pixelType} Pixel</div>
                <div className='trackingId'>Tracking ID: {trackingId}</div>
              </div>
          </div>
             {TrackingIdContainer.renderEvent(eventLog, this.props.gaConfig)}
          <br></br>
          </div>

        );
    }
}

class TrafficContainer extends React.Component {

 static groupEventsbyID(trafficLog) {
    if (trafficLog.gaTrackingIdIndex) {
      const eventsByIdOutput = {};

      trafficLog.gaTrackingIdIndex.forEach(function(trackingId){
        for(var j in trafficLog.requests){
            if(trafficLog.requests[j].gaTrackingId === trackingId){
              eventsByIdOutput[trackingId] = eventsByIdOutput[trackingId] || {};
              eventsByIdOutput[trackingId][j] = trafficLog.requests[j];
            }
        }
      })
     return eventsByIdOutput;

    }
  return '';
  }

    static renderTrackingIds(trackingIdLog, gaConfig) {
        if (trackingIdLog) {
            return Object.keys(trackingIdLog).map((key) => {
               // const {url, requestDuration, status} = trackingIdLog[key];
              return (<TrackingIdContainer eventLog={trackingIdLog[key]} id={key} key={key} gaConfig={gaConfig} />);
            });
        }
        return '';
    }

    render() {

      const trafficLog = this.props.traffic;
      const trackingIdLog = TrafficContainer.groupEventsbyID(trafficLog);

      //console.log(JSON.stringify(this.props.traffic));
        return (
            <div className = 'trackingIdBuckets'>
                {TrafficContainer.renderTrackingIds(trackingIdLog, this.props.gaConfig)}
            </div>
        );
    }
}


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            traffic: {},
            gaConfig: {},
            parentHostname: '',
            manifestVersion: ''
        };
    }
    static getHostname(href) {
        var l = document.createElement("a");
        l.href = href;
        return l.hostname;
    };

    timer() {
       // setState method is used to update the state
       this.retrieveBackgroundMsg();
    }

    componentWillMount() {
      //retrieves Network Calls from Background JS
      this.retrieveBackgroundMsg();

      getGAConfig((config) => { // Gets GA Config JSON from localstorage
          // For Polling Logic to make sure all new Network calls are captured
          var intervalId = setInterval(this.timer.bind(this), 1000);
          this.setState({
              intervalId: intervalId,
              gaConfig: JSON.parse(config)
          });

      });
    }

    componentWillUnmount(){
      clearInterval(this.state.intervalId);
    }

    retrieveBackgroundMsg(){
      chrome.runtime.sendMessage({type: 'popupInit'}, (response) => {
          if (response) {
            this.setState({
                loaded: true,
                parentHostname: App.getHostname(response.url),
                traffic: Object.assign(this.state.traffic, response.data),
                manifestVersion: response.version
            });
          }
      });
    }

    popWindow(){
      chrome.windows.create({'url': 'index.html', 'type': 'popup'}, function(window) {
      });
    }
    render() {
      let gaIndex = this.state.traffic.gaTrackingIdIndex || '';
      //console.log(this.state.traffic);
        return (
          <div className="App">
            <header className="App-Header">
              <div>
                <img className='App-logo' src={vice_tech_logo} alt="vice_tech_logo" />
              </div>
              <div className='App-Banner'>
                <span className="App-Title">Google Analytics and Segment Helper</span><br></br>
                <span className="App-Version">Version {this.state.manifestVersion} - </span>
                <a className='App-LearnMore' href="https://rebrand.ly/gadeb3ec4a" rel="noopener noreferrer" target="_blank">Feedback</a>
              </div>
              <div className='App-popout'>
                <img className='App-Popout-image' src={pop_window_icon} alt="pop_window" onClick={() => this.popWindow()}/>
              </div>
            </header>
            <div className="App-summary">
              <span><span id="pixelCount">{gaIndex.length}</span> pixel{(gaIndex.length > 1) ? 's' :''} found on <span id="domain">{this.state.parentHostname}</span>
            </span>
            </div>
            <div className="App-body">
              <div className="linebreak"></div>
                <TrafficContainer traffic={this.state.traffic} gaConfig={this.state.gaConfig}/>
            </div>
          </div>
        );
    }
}

export default App;
