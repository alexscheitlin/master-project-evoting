import React from 'react'
import { FiniteFieldVoting } from '../components/FiniteFieldVoting'
import { EllipticCurveVoting } from '../components/EllipticCurveVoting'

const DemoPage: React.FC = () => {
  return (
    <>
      <FiniteFieldVoting />
      <EllipticCurveVoting />
    </>
  )
}

export default DemoPage
