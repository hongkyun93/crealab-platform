"use client"

import React, { createContext, useContext, useEffect } from "react"
import { useProductsSWR, productMutations } from "@/lib/hooks/use-products-swr"
import { createClient } from "@/lib/supabase/client"
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

export function ProductProvider({ children, userId }: { children: React.ReactNode, userId?: string }) {
    // Use SWR hook for data fetching
    const { products, isLoading, revalidate } = useProductsSWR()

    // Setup Realtime subscription for live updates
    useEffect(() => {
        const supabase = createClient()

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

    // Wrapper functions to maintain API compatibility
    const addProduct = async (newProduct: Omit<Product, "id" | "brandId" | "createdAt">) => {
        if (!userId) {
            throw new Error('User ID required to create product')
        }
        await productMutations.addProduct(userId, newProduct)
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
