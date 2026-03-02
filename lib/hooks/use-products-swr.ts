import { createClient } from '@/lib/supabase/client'
import { SWR_KEYS } from '@/lib/swr-config'
import type { Product } from '@/lib/types'
import useSWR, { mutate } from 'swr'

/**
 * Fetcher for all products
 */
async function fetchProducts(): Promise<Product[]> {
    const supabase = createClient()
    console.log('[useProducts] Fetching products...')

    const { data, error } = await supabase
        .from('brand_products')
        .select(`
      *,
      profiles(display_name, avatar_url, description)
    `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        // Ignore AbortError (happens when component unmounts during fetch)
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
            return []
        }

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
        brandBio: p.profiles?.description,
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
        channels: p.channels || [],
        createdAt: p.created_at,
        isMock: p.is_mock || false,
        isActive: p.is_active // undefined이면 컬럼 없음 → 필터 통과
    }))

    console.log('[useProducts] Loaded products:', mapped.length)
    // is_active 컬럼이 있으면 false 항목 제외 (없으면 전체 반환)
    return mapped.filter((p: any) => (p as any).isActive !== false)
}

/**
 * Fetcher for hidden (is_active=false) products — brand only
 */
async function fetchHiddenProducts(): Promise<Product[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('brand_products')
        .select(`*, profiles(display_name, avatar_url, description)`)
        .eq('is_active', false)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) return []

    return (data || []).map((p: any) => ({
        id: p.id,
        brandId: p.brand_id,
        brandName: p.profiles?.display_name || 'Brand',
        brandAvatar: p.profiles?.avatar_url,
        brandBio: p.profiles?.description,
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
        channels: p.channels || [],
        createdAt: p.created_at,
        isMock: p.is_mock || false,
        isActive: p.is_active // undefined이면 컬럼 없음
    }))
        // is_active=false인 것만 반환 (컬럼 없으면 빈 배열)
        .filter((p: any) => (p as any).isActive === false)
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

export function useHiddenProductsSWR() {
    const { data, error, isLoading } = useSWR(
        'HIDDEN_PRODUCTS',
        fetchHiddenProducts,
        { revalidateOnFocus: true, dedupingInterval: 5000 }
    )
    return { hiddenProducts: data || [], error, isLoading }
}

/**
 * Mutation functions for products
 */
export const productMutations = {
    /**
     * Add a new product (Team-based or User-based)
     */
    async addProduct(
        userId: string,
        newProduct: Omit<Product, "id" | "brandId" | "createdAt">,
        teamId?: string
    ): Promise<void> {
        const supabase = createClient()
        console.log('[productMutations] Creating product:', { userId, teamId })

        const insertData: any = {
            brand_id: userId, // Always required
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
            account_tag: newProduct.accountTag,
            channels: newProduct.channels || []
        }

        // Add team_id if provided
        if (teamId) {
            insertData.team_id = teamId
        }

        const { data, error } = await supabase
            .from('brand_products')
            .insert(insertData)
            .select()
            .single()

        if (error) {
            console.error('[productMutations] Create error:', error)
            console.error('[productMutations] Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            console.error('[productMutations] Insert data:', insertData)
            throw new Error(`제품 등록 실패: ${error.message} (Code: ${error.code})`)
        }

        // Revalidate cache
        await mutate(SWR_KEYS.PRODUCTS_ALL)
        console.log('[productMutations] Product created successfully')
    },

    /**
     * Update an existing product
     */
    async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
        const supabase = createClient()
        console.log('[productMutations] Updating product:', id)

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
        if (updates.channels !== undefined) dbUpdates.channels = updates.channels

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
        const supabase = createClient()
        console.log('[productMutations] Deleting product:', id)

        // FK 체크: product_applications에 이 상품을 참조하는 지원 이력이 있으면 삭제 불가
        const { count } = await supabase
            .from('product_applications')
            .select('id', { count: 'exact', head: true })
            .eq('product_id', id)

        if (count && count > 0) {
            throw new Error(`이 상품에 지원 이력(${count}건)이 있어 삭제할 수 없습니다. 지원 이력이 있는 상품은 삭제 대신 비공개 처리해주세요.`)
        }

        const { error } = await supabase
            .from('brand_products')
            .delete()
            .eq('id', id)

        if (error) {
            const isRlsError = Object.keys(error).length === 0
            console.error('[productMutations] Delete error:', JSON.stringify(error), isRlsError ? '→ RLS 정책 거부' : '')
            throw isRlsError ? new Error('삭제 권한이 없습니다.') : error
        }

        // Revalidate cache
        await mutate(SWR_KEYS.PRODUCTS_ALL)
        console.log('[productMutations] Product deleted')
    },

    /**
     * Hide a product (is_active = false)
     */
    async hideProduct(id: string): Promise<void> {
        const supabase = createClient()
        const { error } = await supabase
            .from('brand_products')
            .update({ is_active: false })
            .eq('id', id)
        if (error) throw error
        await mutate(SWR_KEYS.PRODUCTS_ALL)
        await mutate('HIDDEN_PRODUCTS')
        console.log('[productMutations] Product hidden:', id)
    },

    /**
     * Restore a hidden product (is_active = true)
     */
    async activateProduct(id: string): Promise<void> {
        const supabase = createClient()
        const { error } = await supabase
            .from('brand_products')
            .update({ is_active: true })
            .eq('id', id)
        if (error) throw error
        await mutate(SWR_KEYS.PRODUCTS_ALL)
        await mutate('HIDDEN_PRODUCTS')
        console.log('[productMutations] Product activated:', id)
    },
}
