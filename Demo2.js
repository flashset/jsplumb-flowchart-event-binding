import React, { Component } from "react";
import { jsPlumb } from "jsplumb";
import { toastr } from "react-redux-toastr";
import { Button } from "react-bootstrap";
import { Link } from "gatsby";

const JSPLUMB_ID = "jsplumb_box";

// #region Arrow

const arrowCommon = {
    foldback: 0.5,
    width: 14,
};
const overlays = [
    [
        "Arrow",
        {
            location: 1,
        },
        arrowCommon,
    ],
];
const jsPlumbSettings = {
    ConnectionOverlays: overlays,
};

// #endregion

//#region  edges and nodes
let edges = [];

let nodes = [
    {
        id: "1",
        type: "rectangle",
        name: "Node 1",
        style: { left: "100px", top: "100px" },
    },
    {
        id: "2",
        type: "diamond",
        name: "Node 2",
        style: { left: "450px", top: "50px" },
    },
    {
        id: "3",
        type: "circle",
        name: "Node 3",
        style: { left: "800px", top: "75px" },
    },
];
//#endregion

//#region endpoint styles
let sourceEndpointStyle = {
    fill: "#1fb139",
    fillStyle: "#1fb139",
};
let targetEndpointStyle = {
    fill: "#f65d3b",
    fillStyle: "#f65d3b",
};
let endpoint = [
    "Dot",
    {
        cssClass: "endpointClass",
        radius: 5,
        hoverClass: "endpointHoverClass",
    },
];
let connector = [
    "Flowchart",
    {
        cssClass: "connectorClass",
        hoverClass: "connectorHoverClass",
    },
];
let connectorStyle = {
    lineWidth: 2,
    stroke: "#15a4fa",
    strokeStyle: "#15a4fa",
};
let hoverStyle = {
    stroke: "#1e8151",
    strokeStyle: "#1e8151",
    lineWidth: 2,
};
let anSourceEndpoint = {
    endpoint: endpoint,
    paintStyle: sourceEndpointStyle,
    hoverPaintStyle: {
        fill: "#449999",
        fillStyle: "#449999",
    },
    isSource: true,
    maxConnections: -1,
    anchor: ["BottomCenter"],
    connector: connector,
    connectorStyle: connectorStyle,
    connectorHoverStyle: hoverStyle,
};
let anTargetEndpoint = {
    endpoint: endpoint,
    paintStyle: targetEndpointStyle,
    hoverPaintStyle: {
        fill: "#449999",
        fillStyle: "#449999",
    },
    isTarget: true,
    maxConnections: -1,
    anchor: ["TopCenter"],
    connector: connector,
    connectorStyle: connectorStyle,
    connectorHoverStyle: hoverStyle,
};
//#endregion

class Demo2 extends Component {
    state = {
        edges,
        nodes,
        jsPlumbInstance: null,
        isJsPlumbInstanceCreated: false,
        dragging: false, // Whether to trigger canvas drag
        nodeDragging: false, // Whether to trigger node drag
        _ratio: 0.25, // Roller ratio
        _scale: 1, // Canvas zoom ratio
        _left: 0, // Canvas Left position
        _top: 0, // Top position of the canvas
        _initX: 0, // Drag the X position when the mouse is pressed
        _initY: 0, // Drag the Y position when the mouse is pressed
    };

    showMessage = (message) => {
        const toastrOptions = {
            timeOut: 2000, // by setting to 0 it will prevent the auto close
            icon: null, // You can add any component you want but note that the width and height are 70px ;)
            onShowComplete: () => console.log("SHOW: animation is done"),
            onHideComplete: () => console.log("HIDE: animation is done"),
            onCloseButtonClick: () => console.log("Close button was clicked"),
            onToastrClick: () => console.log("Toastr was clicked"),
            showCloseButton: true, // false by default
            closeOnToastrClick: true, // false by default, this will close the toastr when user clicks on it
        };
        toastr.info("Info", message, toastrOptions);
    };

    //#region Events
    onConnection = (connObj, originalEvent) => {
        if (!originalEvent) {
            return;
        }
        connObj.connection.setPaintStyle({
            stroke: "#8b91a0",
            strokeStyle: "#8b91a0",
        });
        let sourceId = connObj.sourceId;
        let targetId = connObj.targetId;
        this.setState({
            edges: [
                ...this.state.edges,
                {
                    sourceId: sourceId,
                    targetId: targetId,
                },
            ],
        });
        return false;
    };
    // Delete line event
    onDelConnection = (connObj, originalEvent) => {
        if (!originalEvent) {
            return;
        }
        this.setState({
            edges: this.state.edges.filter(
                (conn) =>
                    !(
                        conn.sourceId === connObj.sourceId &&
                        conn.targetId === connObj.targetId
                    )
            ),
        });
        return false;
    };

    // Binding events passed in by the parent component
    setEventListeners = (jsPlumbInstance) => {
        const eventListeners = this.props.eventListeners;
        if (
            eventListeners &&
            typeof eventListeners === "object" &&
            typeof eventListeners.length === "number"
        ) {
            Object.keys(eventListeners).forEach((event) => {
                if (typeof eventListeners[event] !== "undefined") {
                    jsPlumbInstance.bind(event, eventListeners[event]);
                }
            });
        }
    };

    // Zoom canvas
    onCanvasMousewheel = (e) => {
        let self = this.state;
        //enlarge
        if (e.deltaY < 0) {
            this.setState({
                _scale: self._scale + self._scale * self._ratio,
            });
        }
        //Zoom out
        if (e.deltaY > 0) {
            this.setState({
                _scale: self._scale - self._scale * self._ratio,
            });
        }
    };
    // Move the canvas
    onCanvasMousemove = (e) => {
        let self = this.state;
        if (!self.dragging) {
            return;
        }
        this.refs[JSPLUMB_ID].style.left =
            self._left + e.pageX - self._initX + "px";
        this.refs[JSPLUMB_ID].style.top =
            self._top + e.pageY - self._initY + "px";
    };
    // Drag the canvas
    onCanvasMousedown = (e) => {
        this.setState({
            _initX: e.pageX,
            _initY: e.pageY,
            dragging: true,
        });
    };
    // Release the canvas
    onCanvasMouseUpLeave = (e) => {
        let self = this.state;

        if (self.dragging) {
            let _left = self._left + e.pageX - self._initX;
            let _top = self._top + e.pageY - self._initY;

            this.refs[JSPLUMB_ID].style.left = _left + "px";
            this.refs[JSPLUMB_ID].style.top = _top + "px";
            this.setState({
                _left,
                _top,
                nodeDragging: false,
                dragging: false,
            });
        } else if (self.nodeDragging) {
            // node reset
            this.resetNode();
        }
    };

    resetNode = (options) => {
        let nodesDom =
            this.refs[JSPLUMB_ID].querySelectorAll(".sf-canvas-node");
        if (options) {
            this.refs[JSPLUMB_ID].style.left = "0px";
            this.refs[JSPLUMB_ID].style.top = "0px";
        }
        options = options || {};
        this.setState({
            ...options,
            nodeDragging: false,
            nodes: this.state.nodes.map((el) => {
                for (let i = 0, l = nodesDom.length; i < l; i++) {
                    let nodeDom = nodesDom[i];
                    if (nodeDom.id == el.id) {
                        el.style = {
                            top: nodeDom.style.top,
                            left: nodeDom.style.left,
                        };
                        break;
                    }
                }
                return el;
            }),
        });
    };

    //#endregion

    componentDidUpdate() {
        if (this.state.jsPlumbInstance) {
            //#region endpoint styles
            //Draw a point
            let nodes = this.state.nodes;
            for (let i = 0; i < nodes.length; i++) {
                let nUUID = nodes[i].id;
                this.state.jsPlumbInstance.addEndpoint(
                    nUUID,
                    anSourceEndpoint,
                    {
                        uuid: nUUID + "-bottom",
                        anchor: "Bottom",
                        maxConnections: -1,
                    }
                );
                this.state.jsPlumbInstance.addEndpoint(
                    nUUID,
                    anTargetEndpoint,
                    {
                        uuid: nUUID + "-top",
                        anchor: "Top",
                        maxConnections: -1,
                    }
                );
                this.state.jsPlumbInstance.draggable(nUUID);
            }

            //Draw a line
            let edges = this.state.edges;
            for (let j = 0; j < edges.length; j++) {
                let connection = this.state.jsPlumbInstance.connect({
                    uuids: [
                        edges[j].sourceId + "-bottom",
                        edges[j].targetId + "-top",
                    ],
                });
                connection.setPaintStyle({
                    stroke: "#8b91a0",
                    strokeStyle: "#8b91a0",
                });
            }
            //#endregion
        }
    }

    componentDidMount() {
        jsPlumb.ready(() => {
            const jsPlumbInstance = jsPlumb.getInstance(jsPlumbSettings || {});
            jsPlumbInstance.setContainer(document.getElementById(JSPLUMB_ID));

            //#region binding events
            jsPlumbInstance.bind("connection", this.onConnection);
            jsPlumbInstance.bind("connectionDetached", this.onDelConnection);
            this.setEventListeners(jsPlumbInstance);
            //#endregion

            this.setState({
                isJsPlumbInstanceCreated: true,
                jsPlumbInstance,
            });
        });
    }

    render() { 
        const nodesDom = this.state.nodes.map((node) => {
            const style = node.style || {}; 
            switch (node.type) {
                case "diamond":
                    return (
                        <div
                            className="sf-diamond"
                            key={node.id}
                            style={style}
                            id={node.id}
                        >
                            <div className="sf-diamond-inner">
                                <h3 className="sf-node-title">{node.name}</h3>
                            </div>
                        </div>
                    );

                case "circle":
                    return (
                        <div
                            className="sf-circle"
                            key={node.id}
                            style={style}
                            id={node.id}
                        >
                            <div className="sf-circle-inner">
                                <h3 className="sf-node-title">{node.name}</h3>
                            </div>
                        </div>
                    );
                default:
                    return (
                        <div
                            className="sf-rectagle"
                            key={node.id}
                            style={style}
                            id={node.id}
                        >
                            <div className="sf-rectagle-inner">
                                <h3 className="sf-node-title">{node.name}</h3>
                            </div>
                        </div>
                    );
            }
        });

        let translateWidth =
            (document.documentElement.clientWidth * (1 - this.state._scale)) /
            2;
        let translateHeight =
            ((document.documentElement.clientHeight - 60) *
                (1 - this.state._scale)) /
            2;

        return (
            <>
                <Button
                    variant="primary"
                    className="btn btn-primary btn-md m-2 float-right"
                    onClick={(e) => {
                        this.resetNode({ _scale: 1, _left: 0, _top: 0 });
                    }}
                >
                    Reset
                </Button>
                <Link to="/blog/jsplumb-flowchart-event-binding">
                    <Button
                        variant="primary"
                        className="btn btn-primary btn-md m-2 float-right"
                    >
                        Go to Article
                    </Button>
                </Link>
                <div className="jsplumb-canvas-container">
                    <div
                        key={JSPLUMB_ID}
                        className="jsplumb-box"
                        onWheel={this.onCanvasMousewheel}
                        onMouseMove={this.onCanvasMousemove}
                        onMouseDown={this.onCanvasMousedown}
                        onMouseUp={this.onCanvasMouseUpLeave}
                        onMouseLeave={this.onCanvasMouseUpLeave}
                        onContextMenu={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                        }}
                    >
                        <div
                            className="jsplumb-canvas"
                            ref={JSPLUMB_ID}
                            id={JSPLUMB_ID}
                            style={{
                                transformOrigin: "0px 0px 0px",
                                transform: `translate(${translateWidth}px, ${translateHeight}px) scale(${this.state._scale})`,
                            }}
                        >
                            {nodesDom}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default Demo2;
