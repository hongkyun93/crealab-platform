"use client"

import { productMutations, useProductsSWR, useHiddenProductsSWR } from "@/lib/hooks/use-products-swr"
import { SWR_KEYS } from '@/lib/swr-config'
import type { Product } from "@/lib/types"
import React, { createContext, useContext, useEffect } from "react"
import { mutate } from 'swr'
import { useAuth } from "./auth-provider"

interface ProductContextType {
    products: Product[]
    hiddenProducts: Product[]
    isLoading: boolean
    addProduct: (product: Omit<Product, "id" | "brandId" | "createdAt">) => Promise<void>
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
    deleteProduct: (id: string) => Promise<void>
    hideProduct: (id: string) => Promise<void>
    activateProduct: (id: string) => Promise<void>
    refreshProducts: () => Promise<void>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children, userId, teamId }: {
    children: React.ReactNode,
    userId?: string,
    teamId?: string
}) {
    const { supabase } = useAuth()
    const { products, isLoading, revalidate } = useProductsSWR()
    const { hiddenProducts } = useHiddenProductsSWR()

    // Log Product Loading
    useEffect(() => {
        if (isLoading) {
            window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: '제품 데이터 불러오는 중...', type: 'loading' } }))
        } else if (products) {
            window.dispatchEvent(new CustomEvent('app-log', { detail: { msg: `제품 로드 완료 (${products.length}건)`, type: 'success' } }))
        }
    }, [isLoading])

    // Setup Realtime subscription for live updates
    useEffect(() => {
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
                    mutate(SWR_KEYS.PRODUCTS_ALL)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // Wrapper functions to maintain API compatibility (Team-based or User-based)
    const addProduct = async (newProduct: Omit<Product, "id" | "brandId" | "createdAt">) => {
        if (!userId) {
            throw new Error('User ID required to create product')
        }
        // Products belong to the brand user AND the team (if exists)
        await productMutations.addProduct(userId, newProduct, teamId)
    }

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        await productMutations.updateProduct(id, updates)
    }

    const deleteProduct = async (id: string) => {
        await productMutations.deleteProduct(id)
    }

    const hideProduct = async (id: string) => {
        await productMutations.hideProduct(id)
    }

    const activateProduct = async (id: string) => {
        await productMutations.activateProduct(id)
    }

    const refreshProducts = async () => {
        await revalidate()
    }

    return (
        <ProductContext.Provider value={{
            products,
            hiddenProducts,
            isLoading,
            addProduct,
            updateProduct,
            deleteProduct,
            hideProduct,
            activateProduct,
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
