import { useState } from "react"
import { Input } from "../ui/input"

export default function DescriptionEdit({value, onEdit}: {value: string, onEdit: Function}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingValue, setEditingValue] = useState(value)
  return isEditing ? (
    <Input 
      autoFocus
      value={editingValue} 
      onChange={(event: any) => setEditingValue(event.target.value)} 
      className="lg:w-1/2 w-full lg:mx-auto"
      onBlur={() => {
        setIsEditing(false)
        onEdit(editingValue)
      }} 
    />
  ) : (
    <div className="cursor-pointer" onClick={() => {
      setEditingValue("")
      setIsEditing(true)
    }}>
      {value}
    </div>
  )
}