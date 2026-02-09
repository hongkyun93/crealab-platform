'use client'

import { useState, useEffect } from 'react'
import { connectInstagramAccount } from '@/app/actions/instagram'

declare global {
    interface Window {
        fbAsyncInit: () => void;
        FB: any;
    }
}

export function useInstagram() {
    const [isSdkLoaded, setIsSdkLoaded] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

    useEffect(() => {
        if (window.FB) {
            setIsSdkLoaded(true)
            return
        }

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v19.0'
            });
            setIsSdkLoaded(true)
        };

        (function (d, s, id) {
            var js: any, fjs: any = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, [])

    const login = async () => {
        if (!isSdkLoaded || !window.FB) {
            alert("Facebook SDK not loaded yet.")
            return
        }

        setIsConnecting(true)

        window.FB.login(function (response: any) {
            if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                const accessToken = response.authResponse.accessToken;

                // Call Server Action
                connectInstagramAccount(accessToken)
                    .then((result) => {
                        if (result.error) {
                            alert(result.error)
                        } else {
                            alert("Instagram account connected successfully!")
                        }
                    })
                    .finally(() => setIsConnecting(false))

            } else {
                console.log('User cancelled login or did not fully authorize.');
                setIsConnecting(false)
            }
        }, { scope: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement' });
    }

    return {
        login,
        isSdkLoaded,
        isConnecting
    }
}
