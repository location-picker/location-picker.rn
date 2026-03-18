import { ReactNode, createContext, useCallback, useContext, useState } from 'react'

import { BottomSheet } from '@/components/ui/bottom-sheet'

interface OverlayContextInterface {
    open(content: ReactNode): void
    close(): void
}

const OverlayContext = createContext<OverlayContextInterface | undefined>(undefined)

export const useOverlay = () => {
    const ctx = useContext(OverlayContext)
    if (!ctx) throw new Error('useOverlay must be used inside OverlayProvider')
    return ctx
}

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
    const [content, setContent] = useState<ReactNode>(null)
    const [isClosing, setIsClosing] = useState(false)

    const open = useCallback((node: ReactNode) => {
        setContent(node)
    }, [])

    const close = useCallback(() => {
        setIsClosing(true)
    }, [])

    const handleClosed = useCallback(() => {
        setContent(null)
        setIsClosing(false)
    }, [])

    return (
        <OverlayContext.Provider value={{ open, close }}>
            {children}
            {content && <BottomSheet content={content} isClosing={isClosing} onClose={handleClosed} />}
        </OverlayContext.Provider>
    )
}
