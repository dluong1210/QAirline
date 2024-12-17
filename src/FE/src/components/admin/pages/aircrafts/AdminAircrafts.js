import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './AdminAircrafts.module.css';

import { useAirplane } from 'hooks/airplane/useAirplane';

import { LoadState } from 'types/states/LoadState';
import AdminTable from '../../components/AdminTable/AdminTable';
import AdminPageTitle from '../../components/PageTitle/AdminPageTitle';


const mockAircrafts = [
    { idAirplane: 1, code: 'AB123', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 2, code: 'CD456', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 3, code: 'EF789', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 4, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 5, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 6, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 7, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 8, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 9, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 10, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 11, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 12, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 13, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 14, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 15, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 16, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 17, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 18, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 19, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 20, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 21, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 22, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 23, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 24, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 25, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 26, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 27, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 28, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 29, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 30, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 31, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 32, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 33, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 34, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 35, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 36, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 37, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 38, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 39, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 40, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 41, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 42, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 43, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 44, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 45, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 46, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 47, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 48, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 49, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 50, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },   
    { idAirplane: 51, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 52, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 53, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 54, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 55, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 56, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 57, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 58, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 59, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 60, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 61, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 62, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 63, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 64, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 65, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 66, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 67, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 68, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 69, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 70, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 71, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 72, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 73, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 74, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 75, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 76, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 77, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 78, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 79, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 80, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 81, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 82, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 83, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 84, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 85, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 86, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 87, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 88, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 89, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 90, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 91, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 92, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 93, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 94, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 95, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 96, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 97, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 98, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 99, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 100, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 101, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 102, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 103, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 104, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 105, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 106, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 107, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 108, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 109, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 110, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 111, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 112, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 113, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 114, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 115, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 116, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 117, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 118, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 119, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 120, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 121, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 122, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 123, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 124, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 125, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 126, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 127, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 128, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 129, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 130, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 131, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 132, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 133, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 134, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 135, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 136, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 137, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 138, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 139, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 140, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 141, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 142, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 143, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 144, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 145, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 146, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 147, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 148, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 149, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 150, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },   
    { idAirplane: 151, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 152, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 153, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 154, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 155, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 156, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 157, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 158, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 159, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 160, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 161, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 162, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 163, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 164, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 165, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 166, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 167, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 168, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 169, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 170, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 171, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 172, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 173, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 174, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 175, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 176, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 177, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 178, code: 'YZ012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 179, code: 'AB123', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 180, code: 'CD456', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 181, code: 'EF789', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 182, code: 'GH012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 183, code: 'IJ345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 184, code: 'KL678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 185, code: 'MN012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 186, code: 'OP345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 187, code: 'QR678', type: 'Boeing 787', capacity: 330, status: 'Active' },
    { idAirplane: 188, code: 'ST012', type: 'Boeing 737', capacity: 180, status: 'Active' },
    { idAirplane: 189, code: 'UV345', type: 'Airbus A320', capacity: 150, status: 'Maintenance' },
    { idAirplane: 190, code: 'WX678', type: 'Boeing 787', capacity: 330, status: 'Active' },
];

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
            <AdminPageTitle title="Aircraft Management" onAdd={handleAdd} label="Add Aircraft" />

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
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState(aircraft || {
        code: '',
        type: '',
        capacity: '',
        status: 'Active'
    });

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsClosing(true);
        setTimeout(() => {
            onSubmit(formData);
        }, 250);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return createPortal(
        <div 
            className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
            onClick={handleOverlayClick}
        >
            <div className={`${styles.modal} ${isClosing ? styles.closing : ''}`}>
                <h2>{aircraft ? 'Edit Aircraft' : 'Add Aircraft'}</h2>
                <form onSubmit={handleSubmit}>
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
                    <div className={styles.modalActions}>
                        <button type="button" onClick={handleClose}>Cancel</button>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>,
        document.getElementById('adminLayout')
    );
} 