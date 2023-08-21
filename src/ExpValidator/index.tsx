import { Input, Form, Button } from 'antd';
import { useEffect, useState } from 'react';
import { validateExp, calculateAst, buildAst, ExpNode } from './expValidateUtil'
import { AstTree } from './AstTree'


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
  const [output, setOutput] = useState<number|null>(null)
  const [expNode, setExpNode] = useState<ExpNode | null>(null)
  const [form] = Form.useForm<FieldType>()
  const handleCalculation = () => {
    try {
      const exp = form.getFieldValue('exp')
      const ast = buildAst(exp)
      setExpNode(ast)
      const result = calculateAst(ast)
      setOutput(result)
    } catch (error) {
      console.log(error)
      setExpNode(null)
      setOutput(null)
    }
  }

  useEffect(() => {
    let throttled = false
    async function callback(event:KeyboardEvent) {
      if (throttled) return
      if (event.key === "Enter") {
        throttled = true
        try {
          await form.validateFields()
        } catch (error) {
          console.log(error) 
        }
        handleCalculation()
        setTimeout(() => {
          throttled = false
        }, 500);
      }
    }
    document.addEventListener("keydown", callback);
    return () => document.removeEventListener('keydown', callback)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      form.setFieldValue('exp', `(${Math.ceil(14 * Math.random())} - 3) * (100 + 99 / (3 * 3))`)
      handleCalculation()
    }, 1000);
  }, [])

  const exp = form.getFieldValue('exp')

  return (
    <div style={{ height: '100%', width: '100%', paddingTop: 30, display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 10 }}>Enter your four arithmetic expressions</div>
        <Form
          form={form}
          name="basic"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          validateTrigger="onBlur"
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Expression"
            name="exp"
            rules={[{ required: true, validator: expValidator }]}
          >
            <Input.TextArea placeholder='Enter your four arithmetic expressions' size='large' />
          </Form.Item>
        </Form>
        <Button onClick={handleCalculation} type="primary">Calculate</Button>
        <span style={{ marginLeft: 10 }}>{output === null ? '' : `Output: ${output}`}</span>
      </div>
      <div style={{ flex: 1, paddingRight: 10, maxHeight: '80vh', overflow: 'auto' }}>
        {expNode && (
          <div>
            <div style={{ marginBottom: 10 }} >How I calculate:</div>
            <AstTree key={exp} expNode={expNode} />
          </div>
        )}
      </div>
    </div>
  )

}

export default ExpValidator;