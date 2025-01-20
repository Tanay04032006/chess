import React from 'react'

const Button = ({onClick,children}) => {
  return (
    
      <button onClick={onClick} className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded">
              {children}
            </button>
    
  )
}

export default Button
