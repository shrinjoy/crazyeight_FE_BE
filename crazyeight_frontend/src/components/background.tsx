import type { ReactNode } from "react"

interface props  {
children?:ReactNode
}

export function Background({children}:props)
{
    return(<div className="w-dvw h-dvh bg-linear-to-b from-blue-900 to-blue-600 fixed p-0 m-0 top-0">{children}</div>)
}


