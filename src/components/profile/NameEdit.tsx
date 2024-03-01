import { useState } from "react"
import { Input } from "../ui/input"

export default function NameEdit({value, onEdit}: {value: string, onEdit: Function}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingValue, setEditingValue] = useState(value)
  return isEditing ? (
    <Input 
      value={editingValue} 
      onChange={(event: any) => setEditingValue(event.target.value)} 
      onBlur={() => {
        setIsEditing(false)
        onEdit(editingValue)
      }} 
    />
  ) : (
    <div className="cursor-pointer" onClick={() => setIsEditing(true)}>
      {value}
    </div>
  )
}