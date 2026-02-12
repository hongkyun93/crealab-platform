import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import { SWR_KEYS } from '@/lib/swr-config'
import type { Product } from '@/lib/types'

const supabase = createClient()

/**
 * Fetcher for all products
 */
async function fetchProducts(): Promise<Product[]> {
    console.log('[useProducts] Fetching products...')

    const { data, error } = await supabase
        .from('brand_products')
        .select(`
      *,
      profiles(display_name, avatar_url, bio)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[useProducts] Fetch error:', error)
        console.error('[useProducts] Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        })
        if (error.code === '42P01') {
            console.warn('[useProducts] The "brand_products" table is missing - returning empty array')
            return []
        }
        throw error
    }

    const mapped: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        brandId: p.brand_id,
        brandName: p.profiles?.display_name || 'Brand',
        brandAvatar: p.profiles?.avatar_url,
        brandBio: p.profiles?.bio,
        name: p.name,
        price: p.price || 0,
        image: p.image_url || '',
        link: p.website_url || '',
        points: p.selling_points || '',
        shots: p.required_shots || '',
        category: p.category || '기타',
        description: p.description,
        contentGuide: p.content_guide,
        formatGuide: p.format_guide,
        tags: p.tags || [],
        accountTag: p.account_tag,
        createdAt: p.created_at,
        isMock: p.is_mock || false
    }))

    console.log('[useProducts] Loaded products:', mapped.length)
    return mapped
}

/**
 * Custom hook for products with SWR
 */
export function useProductsSWR() {
    const { data, error, isLoading, mutate: revalidate } = useSWR(
        SWR_KEYS.PRODUCTS_ALL,
        fetchProducts,
        {
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            onError: (err) => {
                console.error('[useProducts] SWR error:', err)
            }
        }
    )

    return {
        products: data || [],
        error,
        isLoading,
        revalidate,
    }
}

/**
 * Mutation functions for products
 */
export const productMutations = {
    /**
     * Add a new product
     */
    async addProduct(
        userId: string,
        newProduct: Omit<Product, "id" | "brandId" | "createdAt">
    ): Promise<void> {
        console.log('[productMutations] Creating product:', newProduct)

        const { data, error } = await supabase
            .from('brand_products')
            .insert({
                brand_id: userId,
                name: newProduct.name,
                price: newProduct.price,
                image_url: newProduct.image,
                website_url: newProduct.link,
                selling_points: newProduct.points,
                required_shots: newProduct.shots,
                category: newProduct.category,
                description: newProduct.description,
                content_guide: newProduct.contentGuide,
                format_guide: newProduct.formatGuide,
                tags: newProduct.tags,
                account_tag: newProduct.accountTag
            })
            .select()
            .single()

        if (error) {
            console.error('[productMutations] Create error:', error)
            throw error
        }

        // Revalidate cache
        await mutate(SWR_KEYS.PRODUCTS_ALL)
        console.log('[productMutations] Product created successfully')
    },

    /**
     * Update an existing product
     */
    async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
        console.log('[productMutations] Updating product:', id, updates)

        const dbUpdates: any = {}
        if (updates.name) dbUpdates.name = updates.name
        if (updates.price !== undefined) dbUpdates.price = updates.price
        if (updates.image) dbUpdates.image_url = updates.image
        if (updates.link) dbUpdates.website_url = updates.link
        if (updates.points) dbUpdates.selling_points = updates.points
        if (updates.shots) dbUpdates.required_shots = updates.shots
        if (updates.category) dbUpdates.category = updates.category
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.contentGuide !== undefined) dbUpdates.content_guide = updates.contentGuide
        if (updates.formatGuide !== undefined) dbUpdates.format_guide = updates.formatGuide
        if (updates.tags) dbUpdates.tags = updates.tags
        if (updates.accountTag !== undefined) dbUpdates.account_tag = updates.accountTag

        const { error } = await supabase
            .from('brand_products')
            .update(dbUpdates)
            .eq('id', id)

        if (error) {
            console.error('[productMutations] Update error:', error)
            throw error
        }

        // Revalidate cache
        await mutate(SWR_KEYS.PRODUCTS_ALL)
        console.log('[productMutations] Product updated')
    },

    /**
     * Delete a product
     */
    async deleteProduct(id: string): Promise<void> {
        console.log('[productMutations] Deleting product:', id)

        const { error } = await supabase
            .from('brand_products')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('[productMutations] Delete error:', error)
            throw error
        }

        // Revalidate cache
        await mutate(SWR_KEYS.PRODUCTS_ALL)
        console.log('[productMutations] Product deleted')
    },
}
