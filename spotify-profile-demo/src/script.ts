import myClientId from './key.ts';
import { redirectToAuthCodeFlow, getAccessToken } from "./authCodeWithPkce";

const clientId = myClientId ; // Replace with your client id
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

// Check if an access token is already stored
const storedToken = sessionStorage.getItem("accessToken");

if (storedToken) {
    // Use the stored token to fetch the profile
    const profile = await fetchProfile(storedToken);
    populateUI(profile);
} else if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    //requesting access token by providing the code
    const accessToken = await getAccessToken(clientId, code);
    //storing access token
    sessionStorage.setItem("accessToken", accessToken); 

    //delete the code because this one is not useful anymore
    params.delete("code");
    //cleaning the URL - removing the code
    window.history.replaceState({}, document.title, `${window.location.pathname}?${params}`);

    //fetch and display the profile
    const profile = await fetchProfile(accessToken);
    populateUI(profile);
}

async function fetchProfile(token: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function populateUI(profile: UserProfile) {
    document.getElementById("displayName")!.innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar")!.appendChild(profileImage);
    }
    document.getElementById("id")!.innerText = profile.id;
    document.getElementById("email")!.innerText = profile.email;
    document.getElementById("uri")!.innerText = profile.uri;
    document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url")!.innerText = profile.href;
    document.getElementById("url")!.setAttribute("href", profile.href);
    document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';
}