import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import ModalHeader from "react-bootstrap/esm/ModalHeader";

const ENDPOINT = "http://127.0.0.1:5000";

const Resource = (props) => {
  const socket = useRef(null);
  const [id, setId] = useState(2);
  const [serverId, setServerId] = useState(null);
  const [resourceState, setResourceState] = useState(null);
  const [allocationRequest, setAllocationRequest] = useState(null);
  const [requestQueue, setRequestQueue] = useState(null);
  const [releaseRequest, setReleaseRequest] = useState(null);

  useEffect(() => {
    socket.current = io(ENDPOINT, { autoConnect: false });
    socket.current.onAny((event, ...args) => {
      if (event === "request_queue") {
      }
    });
    // socket.current.auth = { id };
    socket.current.connect();
    // console.log(socket.current);
    socket.current.on("connection", () => {});
    socket.current.on("resource_state", (data) => {
      setResourceState(data);
      const allocationRequest_temp = {};
      const releaseRequest_temp = {};
      const resource_state_temp = {};
      Object.keys(data).map((key) => {
        allocationRequest_temp[key] = 0;
        resource_state_temp[key] = data[key];
        releaseRequest_temp[key] = 0;
      });
      setAllocationRequest({ ...allocationRequest_temp });
      setReleaseRequest({ ...releaseRequest_temp });
      setResourceState({ ...resource_state_temp });
    });
    socket.current.on("request_queue", (queue) => {
      setRequestQueue(queue);
    });
    socket.current.on("error", (msg) => {
      toast.error(msg, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    });
    socket.current.on("warning", (msg) => {
      toast.warning(msg, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    });
    socket.current.on("success", (msg) => {
      toast.success(msg, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });
    });
  }, [id]);

  function handleAddAllocatedResource(e, resource) {
    const allocationRequest_temp = allocationRequest;
    allocationRequest_temp[resource] = allocationRequest[resource] + 1;
    setAllocationRequest({ ...allocationRequest_temp });
  }
  function handleDeleteAllocatedResource(e, resource) {
    const allocationRequest_temp = allocationRequest;
    allocationRequest_temp[resource] =
      allocationRequest[resource] !== 0 ? allocationRequest[resource] - 1 : 0;
    setAllocationRequest({ ...allocationRequest_temp });
  }

  function handleAddReleaseResource(e, resource) {
    const releaseRequest_temp = releaseRequest;
    releaseRequest_temp[resource] = releaseRequest[resource] + 1;
    setReleaseRequest({ ...releaseRequest_temp });
  }
  function handleDeleteReleaseResource(e, resource) {
    const releaseRequest_temp = releaseRequest;
    releaseRequest_temp[resource] =
      releaseRequest[resource] !== 0 ? releaseRequest[resource] - 1 : 0;
    setReleaseRequest({ ...releaseRequest_temp });
  }

  function handleRelease(e) {
    socket.current.emit("release", releaseRequest);
  }
  function handleAllocate(e) {
    socket.current.emit("allocate", allocationRequest);
  }
  return (
    <Container
      style={{
        margin: "auto",

        maxWidth: "100%",
        padding: 8,
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      {socket?.current ? (
        <Row
          style={{
            margin: 8,
            color: "white",
            padding: "4px 16px 4px 16px",
            backgroundColor: "#474747",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {`Client id : ${socket.current.id}`}
        </Row>
      ) : null}

      <Card style={{ margin: 8, padding: 4 }}>
        <Row
          style={{
            margin: 4,
            color: "white",
            padding: "4px 16px 4px 16px",
            backgroundColor: "#791D1D",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          Request queue
        </Row>
        {requestQueue
          ? requestQueue.map((data) => {
              return (
                <Row
                  style={{
                    margin: 4,
                    color: "white",
                    padding: "4px 16px 4px 16px",
                    backgroundColor: "#471D79",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  {data}
                </Row>
              );
            })
          : null}
      </Card>

      {resourceState != null
        ? Object.keys(resourceState).map((resource, status) => {
            return (
              <Card
                style={{
                  margin: 6,
                  color: "#5A5A5A",
                  padding: 0,
                  backgroundColor: "#FFFFFF",
                  border: "none",
                }}
              >
                <Row
                  style={{
                    padding: 0,
                    margin: 2,
                    color: "white",
                    fontSize: 12,
                    backgroundColor: "#FFFFFF",

                    borderRadius: 4,
                  }}
                >
                  <Col
                    sm={{ span: 1 }}
                    style={{
                      padding: "2px 4px 2px 4px",
                      backgroundColor: "#40BB35",
                      borderBottomLeftRadius: 4,
                      borderTopLeftRadius: 4,
                    }}
                  >
                    {resource}
                  </Col>
                  <Col
                    sm={{ span: 11 }}
                    style={{
                      padding: "2px 4px 2px 4px",
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                      backgroundColor: "#2C2C2C",
                    }}
                  >
                    <Row
                      style={{
                        padding: "2px 4px 2px 4px",
                        margin: 2,
                        backgroundColor: "#2C2C2C",
                      }}
                    >
                      {Object.keys(resourceState[resource]).map((id) => {
                        return (
                          <Col
                            style={{
                              padding: "2px 4px 2px 4px",
                              margin: 2,
                              backgroundColor: "#2C2C2C",
                            }}
                          >{`${id} : ${resourceState[resource][id]}`}</Col>
                        );
                      })}
                    </Row>
                  </Col>
                </Row>
              </Card>
            );
          })
        : null}

      <Row
        style={{
          margin: 0,
          padding: 8,
          width: "100%",

          backgroundColor: "white",
          borderRadius: 4,
        }}
      >
        <Row
          style={{
            padding: 4,
            margin: 0,
            backgroundColor: "#2C2C2C",
            color: "white",
            fontWeight: "500",
            fontSize: 14,
            borderRadius: 4,
            width: "100%",
          }}
        >
          <Col style={{ margin: 0, padding: 4, textAlign: "left" }}>
            Release request
          </Col>

          <Col style={{ margin: 0, padding: 4 }}>
            <Row style={{ margin: 0, padding: 4 }}>
              {releaseRequest
                ? Object.keys(releaseRequest).map((key) => {
                    return (
                      <Col
                        style={{
                          margin: 0,
                          padding: "0px 4px 0px 4px",
                          textAlign: "left",
                          color: "#90E62E",
                        }}
                      >{`${key} : ${releaseRequest[key]}`}</Col>
                    );
                  })
                : null}
            </Row>
          </Col>
          <Col
            style={{
              margin: 0,
              padding: 4,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outline-warning"
              style={{
                padding: "2px 4px 2px 4px",
                fontSize: 12,
                margin: "2px 4px 2px 4px",
              }}
              onClick={(e) => {
                handleRelease(e);
              }}
            >
              Release
            </Button>
          </Col>
        </Row>
      </Row>

      <Row
        style={{
          margin: 0,
          padding: 8,
          width: "100%",

          backgroundColor: "white",
          borderRadius: 4,
        }}
      >
        <Row
          style={{
            padding: 4,
            margin: 0,
            backgroundColor: "#2C2C2C",
            color: "white",
            fontWeight: "500",
            fontSize: 14,
            borderRadius: 4,
            width: "100%",
          }}
        >
          <Col style={{ margin: 0, padding: 4, textAlign: "left" }}>
            Allocation request
          </Col>

          <Col style={{ margin: 0, padding: 4 }}>
            <Row style={{ margin: 0, padding: 4 }}>
              {allocationRequest
                ? Object.keys(allocationRequest).map((key) => {
                    return (
                      <Col
                        style={{
                          margin: 0,
                          padding: "0px 4px 0px 4px",
                          textAlign: "left",
                          color: "#90E62E",
                        }}
                      >{`${key} : ${allocationRequest[key]}`}</Col>
                    );
                  })
                : null}
            </Row>
          </Col>
          <Col
            style={{
              margin: 0,
              padding: 4,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="outline-success"
              style={{
                padding: "2px 4px 2px 4px",
                fontSize: 12,
                margin: "2px 4px 2px 4px",
              }}
              onClick={(e) => {
                handleAllocate(e);
              }}
            >
              Allocate
            </Button>
          </Col>
        </Row>
      </Row>

      <Row
        style={{
          margin: 0,
          padding: 4,
          width: "100%",
          height: 200,
          backgroundColor: "white",
          borderRadius: 4,
        }}
      >
        <Card
          style={{
            padding: 4,
            margin: 4,
            backgroundColor: "#2C2C2C",
            color: "white",
            fontWeight: "500",
            fontSize: 14,
            borderRadius: 4,
            width: "100%",
          }}
        >
          {resourceState && allocationRequest && releaseRequest
            ? Object.keys(resourceState).map((resource, status) => {
                return (
                  <Row style={{ padding: 4, margin: 0 }}>
                    <Col style={{ padding: 2, margin: 0 }}>{resource}</Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      Allocation amount
                    </Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      <Button
                        variant="light"
                        style={{
                          padding: "2px 4px 2px 4px",
                          fontSize: 12,
                          margin: "2px 4px 2px 4px",
                        }}
                        onClick={(e) => {
                          handleAddAllocatedResource(e, resource);
                        }}
                      >
                        Increment
                      </Button>
                    </Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      {allocationRequest[resource]}
                    </Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      <Button
                        variant="light"
                        style={{
                          padding: "2px 4px 2px 4px",
                          margin: "2px 4px 2px 4px",
                          fontSize: 12,
                        }}
                        onClick={(e) => {
                          handleDeleteAllocatedResource(e, resource);
                        }}
                      >
                        Decrement
                      </Button>
                    </Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      Release amount
                    </Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      <Button
                        variant="light"
                        style={{
                          padding: "2px 4px 2px 4px",
                          fontSize: 12,
                          margin: "2px 4px 2px 4px",
                        }}
                        onClick={(e) => {
                          handleAddReleaseResource(e, resource);
                        }}
                      >
                        Increment
                      </Button>
                    </Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      {releaseRequest[resource]}
                    </Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      <Button
                        variant="light"
                        style={{
                          padding: "2px 4px 2px 4px",
                          fontSize: 12,
                          margin: "2px 4px 2px 4px",
                        }}
                        onClick={(e) => {
                          handleDeleteReleaseResource(e, resource);
                        }}
                      >
                        Decrement
                      </Button>
                    </Col>
                  </Row>
                );
              })
            : null}
        </Card>
      </Row>
    </Container>
  );
};

export default Resource;
