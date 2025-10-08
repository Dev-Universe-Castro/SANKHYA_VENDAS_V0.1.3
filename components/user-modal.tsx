"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from "@/lib/users-service"

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (userData: Omit<User, "id"> | User) => void
  user?: User | null
  mode: "create" | "edit"
}

export default function UserModal({ isOpen, onClose, onSave, user, mode }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Vendedor",
    status: "ativo" as "ativo" | "pendente" | "bloqueado",
    password: "",
    avatar: "",
  })
  const [isInitializing, setIsInitializing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  useEffect(() => {
    if (isOpen) {
      setIsInitializing(true)
      
      if (user && mode === "edit") {
        console.log("📋 Carregando dados do usuário:", user)
        const newFormData = {
          name: user.name || "",
          email: user.email || "",
          role: user.role || "Vendedor",
          status: user.status || "ativo",
          password: "",
          avatar: user.avatar || "",
        }
        console.log("📝 Dados do formulário:", newFormData)
        setFormData(newFormData)
      } else {
        setFormData({
          name: "",
          email: "",
          role: "Vendedor",
          status: "ativo",
          password: "",
          avatar: "",
        })
      }
      
      setTimeout(() => {
        setIsInitializing(false)
      }, 100)
    }
  }, [user, mode, isOpen])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const dataToSave = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        avatar: formData.avatar,
        ...(formData.password && { password: formData.password })
      }

      if (mode === "edit" && user) {
        await onSave({ ...user, ...dataToSave })
      } else {
        await onSave(dataToSave)
      }
      onClose()
    } catch (error) {
      console.error("Erro ao salvar:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Loading Overlay */}
      {(isSaving || isInitializing) && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg border">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-foreground">
              {isInitializing ? "Carregando dados..." : "Salvando..."}
            </p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!isSaving && !isInitializing ? onClose : undefined} />

      {/* Modal */}
      <div className="relative bg-card rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {mode === "create" ? "Cadastrar Usuário" : "Editar Usuário"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-3 pb-2 border-b">
            <Avatar className="w-20 h-20 border-2 border-primary">
              <AvatarImage src={formData.avatar || "/placeholder-user.png"} alt={formData.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {formData.name ? getInitials(formData.name) : "US"}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">Preview da foto do perfil</p>
          </div>

          {/* Avatar URL */}
          <div>
            <Label htmlFor="avatar" className="text-sm font-medium text-foreground">
              URL da Foto
            </Label>
            <Input
              id="avatar"
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="mt-1"
              placeholder="https://exemplo.com/foto.jpg"
            />
          </div>

          {mode === "edit" && (
            <div>
              <Label htmlFor="id" className="text-sm font-medium text-foreground">
                ID
              </Label>
              <Input id="id" type="text" value={user?.id || ""} disabled className="mt-1 bg-muted" />
            </div>
          )}

          <div>
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Nome *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-1"
              placeholder="Digite o nome completo"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-sm font-medium text-foreground">
              Função *
            </Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Gerente">Gerente</SelectItem>
                <SelectItem value="Vendedor">Vendedor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status" className="text-sm font-medium text-foreground">
              Status *
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "ativo" | "pendente" | "bloqueado") => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "create" && (
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={mode === "create"}
                className="mt-1"
                placeholder="Digite a senha"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 bg-transparent"
              disabled={isSaving || isInitializing}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSaving || isInitializing}
            >
              {isSaving ? "Salvando..." : (mode === "create" ? "Cadastrar" : "Salvar")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
