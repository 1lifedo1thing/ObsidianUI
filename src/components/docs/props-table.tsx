"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PropDef {
    prop: string
    type: string
    defaultValue?: string
    description: string
}

interface PropsTableProps {
    data: PropDef[]
    title?: string
    className?: string
}

export function PropsTable({ data, title, className }: PropsTableProps) {
    return (
        <div className={cn("my-6 flex flex-col space-y-4", className)}>
            {title && (
                <h4 className="font-heading mt-6 mb-2 text-base font-semibold tracking-tight text-foreground">{title}</h4>
            )}
            <div className="relative w-full overflow-x-auto rounded-lg border border-border bg-background">
                <table className="w-full text-left text-[13px]">
                    <thead className="bg-muted/60">
                        <tr className="border-b border-border">
                            <th scope="col" className="h-10 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">Prop</th>
                            <th scope="col" className="h-10 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">Type</th>
                            <th scope="col" className="h-10 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">Default</th>
                            <th scope="col" className="h-10 px-4 text-left align-middle font-medium whitespace-nowrap text-foreground">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/40">
                                <td className="px-4 py-3 align-top font-mono text-xs font-medium whitespace-nowrap text-foreground">
                                    {item.prop}
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <code className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                                        {item.type}
                                    </code>
                                </td>
                                <td className="px-4 py-3 align-top">
                                    {item.defaultValue ? (
                                        <code className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                                            {item.defaultValue}
                                        </code>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">-</span>
                                    )}
                                </td>
                                <td className="min-w-[220px] px-4 py-3 align-top leading-relaxed text-muted-foreground">
                                    {item.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
