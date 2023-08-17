import { Input, Form, Button } from 'antd';
import { useState } from 'react';
import { validateExp, calculateExp } from './expValidateUtil'


type FieldType = {
  exp?: string;
};

const expValidator = (rule: any, value: any, callback: any) => {
  const { isValid, message } = validateExp(value)
  if (!isValid) {
    callback(message);
  } else {
    callback();
  }
}

function ExpValidator() {
  const [output, setOutput] = useState(0)
  const [form] = Form.useForm<FieldType>()
  const onCalculateClick = () => {
    const exp = form.getFieldValue('exp')
    const result = calculateExp(exp)
    setOutput(result)
  }
  // TODO: show Tree
  return (
    <div>
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        initialValues={{ remember: true }}
        validateTrigger="onBlur"
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="Expression"
          name="exp"
          rules={[{ required: true, type: 'email', validator: expValidator }]}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
      <Button onClick={onCalculateClick} type="primary">Calculate</Button>
      {/* TODO: disabled if validate fail */}
      <span style={{ marginLeft: 10 }}>{output || ''}</span>
    </div>
  )

}

export default ExpValidator;