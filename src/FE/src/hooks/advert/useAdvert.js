import { BACKEND_BASE_URL } from "services/api";

export const useAdvert = () => {
    const uploadAdvert = async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${BACKEND_BASE_URL}/advertisement/uploadImage`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });
        if (response.status === 400) {
            throw new Error((await response.json()).error);
        }
        const data = await response.json();
        return data;
    }

    const createAdvert = async (advert) => {
        const response = await fetch(`${BACKEND_BASE_URL}/advertisement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(advert),
            credentials: 'include',
        });
        const data = await response.json();
        return data;
    }

    const deleteAdvert = async (idAdvertisement) => {
        const response = await fetch(`${BACKEND_BASE_URL}/advertisement/${idAdvertisement}`, {
            method: 'DELETE',
            credentials: 'include',
        });
    }

    const getAllAdvert = async () => {
        const response = await fetch(`${BACKEND_BASE_URL}/advertisement`, {
            credentials: 'include',
        });
        const data = await response.json();
        return data;
    }


    return {
        uploadAdvert,
        createAdvert,
        deleteAdvert,
        getAllAdvert,
    }
}