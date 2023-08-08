import { Input, Form } from 'antd';
import { validateExp } from './expValidateUtil'

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
  return (
    <div>
      <Form
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
          <Input />
        </Form.Item>
      </Form>
    </div>
  )

}

export default ExpValidator;