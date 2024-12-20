import { useState, useEffect } from 'react';
import styles from './AdminAircrafts.module.css';

import { useAirplane } from 'hooks/airplane/useAirplane';

import { LoadState } from 'types/states/LoadState';
import AdminTable from '../../components/AdminTable/AdminTable';
import AdminPageTitle from '../../components/PageTitle/AdminPageTitle';
import AdminModal from '../../components/Modal/AdminModal';


export default function AdminAircrafts() {

    const [aircrafts, setAircrafts] = useState([]);
    const [loadState, setLoadState] = useState(LoadState.LOADING);
    const { getAllAirplane, getAirplane, addAirplane, updateAirplane, deleteAirplane } = useAirplane();

    useEffect(() => {
        handleRefresh();
    }, []);

    const handleRefresh = () => {
        setLoadState(LoadState.LOADING);
        getAllAirplane().then((data) => {
            setAircrafts(data);
            setLoadState(LoadState.SUCCESS);
        }).catch((error) => {
            console.error(error);
            setLoadState(LoadState.ERROR);
        });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAircraft, setEditingAircraft] = useState(null);

    const columns = [
        { key: 'idAirplane', label: 'ID', type: 'number' },
        { key: 'code', label: 'Aircraft Code', type: 'text' },
        { key: 'type', label: 'Aircraft Type', type: 'text' },
        { key: 'capacity', label: 'Capacity', type: 'number' },
        { 
            key: 'status', 
            label: 'Status', 
            type: 'checkbox',
            options: ['Active', 'Maintenance', 'Retired']
        }
    ];

    const handleAdd = () => {
        setEditingAircraft(null);
        setIsModalOpen(true);
    };

    const handleEdit = (aircraft) => {
        setEditingAircraft(aircraft);
        setIsModalOpen(true);
    };

    const handleDelete = (idAirplane) => {
        if (window.confirm('Are you sure you want to delete this aircraft?\n(THIS ACTION IS IRREVERSIBLE)')) {
            deleteAirplane(idAirplane).then(
                setAircrafts(aircrafts.filter(aircraft => aircraft.idAirplane !== idAirplane))
            );
        }
    };

    const handleSubmit = (formData) => {
        if (editingAircraft) {
            // Edit existing aircraft
            updateAirplane(formData).then(
                setAircrafts(aircrafts.map(aircraft => 
                    aircraft.idAirplane === editingAircraft.idAirplane ? { ...formData, idAirplane: aircraft.idAirplane } : aircraft
                ))
            )
        } else {
            // Add new aircraft
            addAirplane(formData).then( newAircraft => {
                console.log(newAircraft);
                handleRefresh()
                // setAircrafts([...aircrafts, { newAircraft }]);
            });
        }
        setIsModalOpen(false);
    };

    return (
        <div className={styles.container}>
            <AdminPageTitle title="Aircrafts Management" onAdd={handleAdd} label="Add Aircraft" />

            <AdminTable
                columns={columns}
                data={aircrafts}
                loadState={loadState}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefresh={handleRefresh}
                idField="idAirplane"
                actions={true}
                itemsPerPage={10}
                pageSizeOptions={[5, 10, 20, 50]}
            />

            {isModalOpen && (
                <AircraftModal
                    aircraft={editingAircraft}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}

function AircraftModal({ aircraft, onClose, onSubmit }) {
    const [formData, setFormData] = useState(aircraft || {
        code: '',
        type: '',
        capacity: '',
        status: 'Active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <AdminModal 
            title={aircraft ? 'Edit Aircraft' : 'Add Aircraft'} 
            onClose={onClose}
            handleSubmit={handleSubmit}
        >
            <div className={styles.formGroup}>
                <label>Aircraft Code</label>
                <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Aircraft Type</label>
                <input
                    type="text"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Capacity</label>
                <input
                    type="number"
                    value={formData.capacity}
                    onChange={e => {
                        const value = e.target.value;   
                        if (value < 0) {
                            return;
                        }
                        setFormData({...formData, capacity: value});
                    }}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Status</label>
                <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                </select>
            </div>
                
            
        </AdminModal>
    );
} 