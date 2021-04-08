import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  InputGroup,
  FormControl,
  Form,
} from "react-bootstrap";
import ModalHeader from "react-bootstrap/esm/ModalHeader";

const ENDPOINT = "http://127.0.0.1:5000";

const Storage = (props) => {
  const socket = useRef(null);
  const [id, setId] = useState(null);
  const [serverId, setServerId] = useState(null);
  const [storageState, setStorageState] = useState(null);
  const [type, setType] = useState("r");
  const [content, setContent] = useState("");
  const [contentStorage, setContentStorage] = useState("a");

  useEffect(() => {
    socket.current = io(ENDPOINT, { autoConnect: false });
    socket.current.onAny((event, ...args) => {
      console.log(event, args);
    });
    // socket.current.auth = { id };
    socket.current.connect();
    // console.log(socket.current);
    socket.current.on("connection", () => {});
    socket.current.on("storage_state", (data) => {
      setStorageState(data);
    });
    socket.current.on("notification", (not) => {
      not.status === "success"
        ? toast.success(not.msg, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
        : toast.error(not.msg, {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
    });
  }, []);

  function handleId(e) {
    e.preventDefault();
    if (id !== null) {
    }
  }
  function handleWrite(e, storage) {
    e.preventDefault();
    socket.current.emit("write", { storage });
  }
  function handleRead(e, storage) {
    e.preventDefault();
    socket.current.emit("read", { storage });
  }
  function handleRelease(e, storage) {
    e.preventDefault();
    socket.current.emit("release", { storage });
  }
  function handleContent(e) {
    e.preventDefault();
    socket.current.emit("content", { storage: contentStorage, type, content });
  }

  return (
    <Container
      style={{
        margin: "auto",
        maxWidth: 400,
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

      {storageState != null
        ? Object.keys(storageState).map((storage, status) => {
            return (
              <Card
                style={{
                  margin: 8,
                  color: "#5A5A5A",
                  padding: 4,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #5a5a5a",
                  borderRadius: 4,
                }}
              >
                <Row
                  style={{
                    padding: "4px 8px 4px 8px",
                    margin: 2,
                    color: "white",
                    fontSize: 12,
                    backgroundColor: "#135313",
                    border: "1px solid #135313",
                    borderRadius: 4,
                  }}
                >{`${storage} : Written by ${storageState[storage].write}`}</Row>
                {storageState[storage].read.map((val) => {
                  return (
                    <Row
                      style={{
                        padding: "4px 8px 4px 8px",
                        margin: 2,
                        color: "white",
                        fontSize: 12,
                        backgroundColor: "#581e73",
                        border: "1px solid #581E73",
                        borderRadius: 4,
                      }}
                    >{`${storage} : Read by ${val}`}</Row>
                  );
                })}
              </Card>
            );
          })
        : null}

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
          {storageState != null
            ? Object.keys(storageState).map((storage, status) => {
                return (
                  <Row style={{ padding: 4, margin: 0 }}>
                    <Col style={{ padding: 2, margin: 0 }}>{storage}</Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      <Button
                        variant="light"
                        style={{
                          width: "100%",
                          padding: "2px 4px 2px 4px",
                          fontSize: 12,
                          margin: "2px 4px 2px 4px",
                        }}
                        onClick={(e) => {
                          handleWrite(e, storage);
                        }}
                      >
                        Write
                      </Button>
                    </Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      <Button
                        variant="light"
                        style={{
                          width: "100%",
                          padding: "2px 4px 2px 4px",
                          margin: "2px 4px 2px 4px",
                          fontSize: 12,
                        }}
                        onClick={(e) => {
                          handleRead(e, storage);
                        }}
                      >
                        Read
                      </Button>
                    </Col>
                    <Col style={{ padding: "2px 8px 2px 8px", margin: 0 }}>
                      <Button
                        variant="outline-warning"
                        style={{
                          width: "100%",
                          padding: "2px 4px 2px 4px",
                          margin: "2px 4px 2px 4px",
                          fontSize: 12,
                        }}
                        onClick={(e) => {
                          handleRelease(e, storage);
                        }}
                      >
                        Release
                      </Button>
                    </Col>
                  </Row>
                );
              })
            : null}
        </Card>
      </Row>
      <Row
        style={{
          margin: 0,
          padding: 8,
          width: "100%",
          height: 200,
          backgroundColor: "white",
          borderRadius: 4,
        }}
      >
        {storageState ? (
          <Form style={{ width: "100%" }}>
            <Form.Row>
              <Form.Group as={Col} controlId="formGridCity">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  onChange={(e) => {
                    setContent(e.target.value);
                  }}
                  value={content}
                />
              </Form.Group>
            </Form.Row>
            <Form.Row>
              <Form.Group as={Col} controlId="formGridState">
                <Form.Label>Type</Form.Label>
                <Form.Control
                  as="select"
                  defaultValue="r"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                  }}
                >
                  <option value="r">replace</option>
                  <option value="a">append</option>
                </Form.Control>
              </Form.Group>

              <Form.Group as={Col} controlId="formGridState">
                <Form.Label>Storage</Form.Label>
                <Form.Control
                  as="select"
                  defaultValue="a"
                  value={contentStorage}
                  onChange={(e) => {
                    setContentStorage(e.target.value);
                  }}
                >
                  {Object.keys(storageState).map((key) => (
                    <option value={key}>{key}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Form.Row>

            <Button
              variant="primary"
              type="submit"
              onClick={(e) => {
                handleContent(e);
              }}
            >
              Submit
            </Button>
          </Form>
        ) : null}
      </Row>
    </Container>
  );
};

export default Storage;
