import { useEffect, useState } from 'react';
import styles from './AdminAdvertisements.module.css';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import AdminPageTitle from 'components/admin/components/PageTitle/AdminPageTitle';
import { useAdvert } from 'hooks/advert/useAdvert';
import toDataURL from 'utils/image/toDataUrl';
import { LoadState } from 'types/states/LoadState';

const mockAdvertisements = [
    {
        idAdvertisement: 1,
        image_url: 'https://example.com/ad1.jpg',
        description: 'Summer Sale',
        // type: 'Summer Sale',
    }
]

export default function AdminAdvertisements() {
    const {uploadAdvert, createAdvert, deleteAdvert, getAllAdvert} = useAdvert();

    const [advertisements, setAdvertisements] = useState(mockAdvertisements);

    const [loadState, setLoadState] = useState(LoadState.LOADING);

    useEffect(() => {
        getAllAdvert().then(data => {
            setAdvertisements(data);
            setLoadState(LoadState.SUCCESS);
        })
    }, [])

    const defaultNewAd = {
        // type: '',
        description: '',
        imageFile: null,
        imagePreview: null
    }

    const [newAd, setNewAd] = useState(defaultNewAd);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewAd({
                ...newAd,
                imageFile: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };

    const handleAddAdvertisement = () => {
        setLoadState(LoadState.LOADING);
        uploadAdvert(newAd.imageFile)
            .then(data => {
                return createAdvert({
                    description: newAd.description,
                    image_url: data.url,
                });
            })
            .then(newAdvert => {
                setAdvertisements(prev => [
                    ...prev,
                    newAdvert,
                ]);
                setNewAd(defaultNewAd);
            })
            .catch(error => {
                console.error("Error uploading advertisement:", error);
                // Handle error (e.g., show a notification to the user)
                setLoadState(LoadState.ERROR);
            })
            .finally(() => {
                setLoadState(LoadState.SUCCESS);
            });
    }

    const handleDeleteAd = (idAdvertisement) => {
        // Implement delete logic
        deleteAdvert(idAdvertisement).then(
            setAdvertisements(prev => prev.filter(ad => ad.idAdvertisement !== idAdvertisement))
        )
    };

    const handleMoveAd = (id, direction) => {
        // Implement order changing logic
    };

    const handleToggleActive = (id) => {
        // Implement toggle active status logic
    };

    return (
        <div className={styles.advertisementsPage}>
            <AdminPageTitle title="Advertisements"/>

            <div className={styles.uploadSection}>
                <h2>Add New Advertisement</h2>
                <div className={styles.uploadForm}>
                    <div className={styles.imageUpload}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            id="imageUpload"
                            className={styles.fileInput}
                        />
                        <label htmlFor="imageUpload" className={styles.uploadLabel}>
                            {newAd.imagePreview ? (
                                <img src={newAd.imagePreview} alt="Preview" />
                            ) : (
                                <>
                                    <FaPlus />
                                    <span>Upload Image</span>
                                </>
                            )}
                        </label>
                    </div>
                    <div className={styles.formFields}>
                        {/* <input
                            type="text"
                            placeholder="Advertisement Title"
                            value={newAd.type}
                            onChange={(e) => setNewAd({ ...newAd, type: e.target.value })}
                        /> */}
                        <input
                            type="text"
                            placeholder="Advertisement Description"
                            value={newAd.description}
                            onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                        />
                        <button className={styles.submitButton} onClick={handleAddAdvertisement} disabled={loadState === LoadState.LOADING}>
                            {loadState === LoadState.LOADING ? (
                                <span className={styles.loadingSpinner}></span>
                            ) : (
                                'Add Advertisement'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.currentAds}>
                <h2>Current Advertisements</h2>
                <div className={styles.adsGrid}>
                    {advertisements.map((ad) => (
                        <div key={ad.idAdvertisement} className={styles.adCard}>
                            <img src={ad.image_url} alt={ad.description} />
                            <div className={styles.adInfo}>
                                <h3>{ad.description}</h3>
                                {/* <a href={ad.link} target="_blank" rel="noopener noreferrer">
                                    {ad.link}
                                </a> */}
                            </div>
                            <div className={styles.adControls}>
                                {/* <button
                                    className={`${styles.toggleButton} ${ad.active ? styles.active : ''}`}
                                    onClick={() => handleToggleActive(ad.idAdvertisement)}
                                >
                                    {ad.active ? 'Active' : 'Inactive'}
                                </button> */}
                                {/* <div className={styles.orderControls}>
                                    <button onClick={() => handleMoveAd(ad.idAdvertisement, 'up')}>
                                        <FaArrowUp />
                                    </button>
                                    <button onClick={() => handleMoveAd(ad.idAdvertisement, 'down')}>
                                        <FaArrowDown />
                                    </button>
                                </div> */}
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDeleteAd(ad.idAdvertisement)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 