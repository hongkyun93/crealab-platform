
const APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;

export async function getLongLivedUserAccessToken(shortLivedToken: string) {
    if (!APP_ID || !APP_SECRET) throw new Error("Missing App Credentials");

    const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortLivedToken}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) throw new Error(data.error.message);
    return data.access_token;
}

export async function getInstagramBusinessAccount(accessToken: string) {
    // 1. Get User's Pages
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (pagesData.error) throw new Error(pagesData.error.message);
    if (!pagesData.data || pagesData.data.length === 0) throw new Error("No Facebook Pages found.");

    // 2. Find Page with Connected Instagram Account
    for (const page of pagesData.data) {
        const igUrl = `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`;
        const igRes = await fetch(igUrl);
        const igData = await igRes.json();

        if (igData.instagram_business_account) {
            return {
                pageId: page.id,
                instagramId: igData.instagram_business_account.id
            };
        }
    }

    throw new Error("No connected Instagram Business Account found on your Pages.");
}

export async function getInstagramProfile(instagramId: string, accessToken: string) {
    const url = `https://graph.facebook.com/v19.0/${instagramId}?fields=username,profile_picture_url,followers_count,biography&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) throw new Error(data.error.message);
    return data;
}
