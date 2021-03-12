import React, { useState } from "react";
import { machinesData, fluorophoresData } from "./quesData";
import {
  message,
  Form,
  Select,
  Button,
  Row,
  Col,
  Input,
} from "antd";

const { Option } = Select;
const { TextArea } = Input;

const Questions = () => {
  const Quesform = () => {
    const [sectionId, setSectionId] = useState(1);
    
    const particlesSizeList = [
      { id: 1, key: "Below 1µm", value: "Below 1µm" },
      { id: 2, key: "1-3 µm", value: "1-3 µm" },
      { id: 3, key: "2µm+", value: "2µm+" },
    ];
    const cellTypeList = [
      { id: 1, key: 1, value: "Single cells" },
      { id: 2, key: 2, value: "Heterogenous population" },
    ];
    
    const onFinish = (values: any) => {
      nextSection();
      message.success("Successfully Sent");
      console.log("Received values of form: ", values);
    };

    const nextSection = () => {
      setSectionId((curId: any) => curId + 1);
    };

    const prevSection = () => {
      setSectionId((curId: any) => curId - 1);
    };

    const renderButton = () => {
      if (sectionId > 5) {
        return undefined;
      } else {
        return (
          <Row>
            <Col sm={24} md={24} xl={24}>
              <div className="btns">
                {sectionId > 1 && (
                  <Button onClick={prevSection} className="nextBtn">
                    Previous
                  </Button>
                )}

                {sectionId < 5 && (
                  <Button onClick={nextSection} className="nextBtn">
                    Next
                  </Button>
                )}

                {sectionId === 5 && (
                  <Form.Item>
                    <Button htmlType="submit">Submit</Button>
                  </Form.Item>
                )}
              </div>
            </Col>
          </Row>
        );
      }
    };
    return (
      <div className="main-form-div">
        <div
          className="step-row"
          style={{
            width: "100%",
            height: "40px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            boxShadow: "0 -1px 5px -1px #000",
            position: "relative",
          }}
        >
          <div
            id="progress"
            style={{
              position: "absolute",
              height: "100%",
              width: `${100 / 6}%`,
            }}
          ></div>
          <div
            className={sectionId === 1 ? "step-col-active" : "step-col"}
            style={{
              width: `${100 / 6}%`,
              textAlign: "center",
              color: "#333",
              position: "relative",
            }}
          >
            <small>Step1</small>
          </div>
          <div
            className={sectionId === 2 ? "step-col-active" : "step-col"}
            style={{
              width: `${100 / 6}%`,
              textAlign: "center",
              color: "#333",
              position: "relative",
            }}
          >
            <small>Step2</small>
          </div>
          <div
            className={sectionId === 3 ? "step-col-active" : "step-col"}
            style={{
              width: `${100 / 6}%`,
              textAlign: "center",
              color: "#333",
              position: "relative",
            }}
          >
            <small>Step3</small>
          </div>
          <div
            className={sectionId === 4 ? "step-col-active" : "step-col"}
            style={{
              width: `${100 / 6}%`,
              textAlign: "center",
              color: "#333",
              position: "relative",
            }}
          >
            <small>Step4</small>
          </div>
          <div
            className={sectionId === 5 ? "step-col-active" : "step-col"}
            style={{
              width: `${100 / 6}%`,
              textAlign: "center",
              color: "#333",
              position: "relative",
            }}
          >
            <small>Step5</small>
          </div>
          <div
            className={sectionId === 6 ? "step-col-active" : "step-col"}
            style={{
              width: `${100 / 6}%`,
              textAlign: "center",
              color: "#333",
              position: "relative",
            }}
          >
            <small>Step6</small>
          </div>
        </div>

        <div className="form-div">
          <Form
            name="questionForm"
            onFinish={onFinish}
            style={{
              display: "flex",
              background: "rgba(100, 120, 140, 0.99)",
              marginTop: "10%",
              position: "relative",
              flexDirection: "column",
            }}
          >
            {sectionId === 1 && (
              <section className="section1">
                <Row>
                  <Col span={24}>
                    <Form.Item
                      name="device"
                      label={
                        <label className="label">
                          To optimize analysis please select your Device
                        </label>
                      }
                      style={{ display: "block" }}
                      // rules={[{ required: true, message: 'Please select your Device!' }]}
                    >
                      <Select
                        showSearch
                        style={{ width: "100%" }}
                        optionFilterProp="children"
                        filterOption={(input: any, option: any) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        placeholder="Please select a device"
                      >
                        {machinesData.map((data: any, index: number) => {
                          return (
                            <Option key={`device${index}`} value={data.key}>
                              {data.value}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </section>
            )}
            {sectionId === 2 && (
              <section className="section1">
                <Row>
                  <Col span={24}>
                    <Form.Item
                      name="cell_type"
                      style={{ display: "block" }}
                      label={
                        <label className="label">
                          What is the cell type are you measuring?
                        </label>
                      }
                      // rules={[{ required: true, message: 'Please select Cell Type!' }]}
                    >
                      <Select
                        style={{ width: "100%" }}
                        placeholder="Please select a Cell Type"
                      >
                        {cellTypeList.map((data: any, index: number) => {
                          return (
                            <Option key={`celltype${index}`} value={data.key}>
                              {data.value}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </section>
            )}

            {sectionId === 3 && (
              <section className="section1">
                <Row>
                  <Col span={24}>
                    <Form.Item
                      name="particles_size"
                      style={{ display: "block" }}
                      label={
                        <label className="label">
                          How big are the particles you are measuring?
                        </label>
                      }
                      // rules={[{ required: true, message: 'Please select your Device!' }]}
                    >
                      <Select
                        style={{ width: "100%" }}
                        placeholder="Please select a Particle Size"
                      >
                        {particlesSizeList.map((data: any, index: number) => {
                          return (
                            <Option key={`cellsize${index}`} value={data.key}>
                              {data.value}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </section>
            )}
            {sectionId === 4 && (
              <section className="section1">
                <Row>
                  <Col span={24}>
                    <Form.Item
                      style={{ display: "block" }}
                      name="fluorophores"
                      label={
                        <label className="label">
                          Select the fluorophores in your analysis
                        </label>
                      }
                    >
                      <Select
                        showSearch
                        style={{ width: "100%" }}
                        placeholder="Select the fluorophores in your analysis"
                        optionFilterProp="children"
                        filterOption={(input: any, option: any) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {fluorophoresData.map((data: any, index: number) => {
                          return (
                            <Option key={`device${index}`} value={data.key}>
                              {data.value}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </section>
            )}
            {sectionId === 5 && (
              <section className="section1" style={{ width: "80%" }}>
                <Row>
                  <Col span={24}>
                    <Form.Item
                      style={{ display: "block" }}
                      name="description"
                      label={
                        <label className="label">
                          Enter brief experiment description
                        </label>
                      }
                      // rules={[{ required: true, message: 'Please enter experiment description!' }]}
                    >
                      <TextArea rows={5} />
                    </Form.Item>
                  </Col>
                </Row>
              </section>
            )}
            {sectionId === 6 && (
              <section className="final-section">
                <Row>
                  <Col span={24}>
                    <h1>Successfully Submitted</h1>
                  </Col>
                </Row>
              </section>
            )}
            <section>{renderButton()}</section>
          </Form>
        </div>
      </div>
    );
  };
  return (
    <div className="block" style={{ background: "lightgrey" }}>
      <div
        className="container-fluid"
        style={{ height: "500px", width: "500px", position: "relative" }}
      >
        <Quesform />
      </div>
    </div>
  );
};
export default Questions;
