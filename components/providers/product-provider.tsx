"use client"

import React, { createContext, useContext, useEffect } from "react"
import { useProductsSWR, productMutations } from "@/lib/hooks/use-products-swr"
import { useAuth } from "./auth-provider"
import { mutate } from 'swr'
import { SWR_KEYS } from '@/lib/swr-config'
import type { Product } from "@/lib/types"

interface ProductContextType {
    products: Product[]
    isLoading: boolean
    addProduct: (product: Omit<Product, "id" | "brandId" | "createdAt">) => Promise<void>
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
    deleteProduct: (id: string) => Promise<void>
    refreshProducts: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children, userId, teamId }: {
    children: React.ReactNode,
    userId?: string,
    teamId?: string
}) {
    const { supabase } = useAuth()
    // Use SWR hook for data fetching (filtered by team for brands)
    const { products, isLoading, revalidate } = useProductsSWR(teamId)

    // Setup Realtime subscription for live updates
    useEffect(() => {

        console.log('[ProductProvider] Setting up Realtime subscription')

        const channel = supabase
            .channel('brand_products_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'brand_products'
                },
                (payload) => {
                    console.log('[ProductProvider] Realtime update:', payload)
                    mutate(SWR_KEYS.PRODUCTS_ALL)
                }
            )
            .subscribe()

        return () => {
            console.log('[ProductProvider] Cleaning up Realtime subscription')
            supabase.removeChannel(channel)
        }
    }, [])

    // Wrapper functions to maintain API compatibility (Team-based)
    const addProduct = async (newProduct: Omit<Product, "id" | "brandId" | "createdAt">) => {
        if (!teamId && !userId) {
            throw new Error('Team ID or User ID required to create product')
        }
        await productMutations.addProduct(teamId || userId!, newProduct)
    }

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        await productMutations.updateProduct(id, updates)
    }

    const deleteProduct = async (id: string) => {
        await productMutations.deleteProduct(id)
    }

    const refreshProducts = async () => {
        await revalidate()
    }

    return (
        <ProductContext.Provider value={{
            products,
            isLoading,
            addProduct,
            updateProduct,
            deleteProduct,
            refreshProducts
        }}>
            {children}
        </ProductContext.Provider>
    )
}

export function useProducts() {
    const context = useContext(ProductContext)
    if (!context) {
        throw new Error('useProducts must be used within ProductProvider')
    }
    return context
}
