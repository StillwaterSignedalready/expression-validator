import React from "react"
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { ExpNode, ExpType, Token } from './expValidateUtil'

let currentKey = 0
function expNode2DataNode(expNode: ExpNode | Token): DataNode {
  if (Object.values(ExpType).includes(expNode.type as any)) {
    if (Array.isArray((expNode as any).children)) {
      const { children } = (expNode as ExpNode)
      if (children.length === 1) return expNode2DataNode(children[0])
      return ({
        title: 'exp',
        key: currentKey++,
        children: children.map(child => expNode2DataNode(child))
      })
    }
  }
  return {
    title: (expNode as Token).value,
    key: currentKey++,
    style: { color: expNode.type === 'number' ? 'olive' : 'plum', fontWeight: 'bolder' },
    isLeaf: true
  }
}

export const AstTree: React.FC<{ expNode: ExpNode }> = (props) => {
  const { expNode } = props
  currentKey = 0
  const treeData = expNode2DataNode(expNode)
  return (
    <Tree
      defaultExpandAll
      showLine
      treeData={[treeData]}
    />

  )
}
