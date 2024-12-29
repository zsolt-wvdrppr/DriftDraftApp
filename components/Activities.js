'use client';

import { useEffect, useState, useRef, useTransition } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@nextui-org/react";
import { IconEdit, IconTrash, IconEye, IconShare, IconWand, IconSquareRoundedXFilled, IconInfoCircleFilled } from '@tabler/icons-react';
import { Tooltip } from 'react-tooltip';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Spinner } from "@nextui-org/react";

import { createOrUpdateProfile } from "@/lib/supabaseClient";
import logger from '@/lib/logger';
import { useAuth } from '@/lib/AuthContext';

import { useSessionContext } from '@/lib/SessionProvider';

export default function UserActivities() {

    const { fetchAllSessionsFromDb, deleteSessionFromDb, initSessionFromDb } = useSessionContext();
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const { isOpen: isViewModalOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
    const [isPending, startTransition] = useTransition();
    const { user, loading } = useAuth(); // Access user state
    const router = useRouter();

    useEffect(() => {
        startTransition(() => {
            const fetchSessions = async () => {
                try {
                    logger.info('Fetching sessions from DB...');
                    const sessions = await fetchAllSessionsFromDb(); // Await the data
                    setItems(sessions); // Update the state with the fetched sessions
                } catch (error) {
                    logger.error('Error fetching sessions from DB:', error.message);
                }
            };

            fetchSessions(); // Call the async function
        });
    }, []);


    useEffect(() => {
        logger.debug('Items list:', items);
    }, [items]);

    useEffect(() => {
        if (loading) return; // Wait until loading is complete

        if (!user) {
            // Redirect if user is not logged in
            const redirectPath = `/login?redirect=/activities`;

            router.push(redirectPath);

            return;
        }
        logger.debug('ensureProfileExists:', user);
        const ensureProfileExists = async () => {
            await createOrUpdateProfile();
        };

        ensureProfileExists();
    }, [loading, user, router]);

    const confirmDelete = (item) => {
        setSelectedItem(item);
        onDeleteOpen();
    };

    const handleDelete = () => {
        if (selectedItem) {
            setItems(items.filter(item => item.session_id !== selectedItem.session_id));
            setSelectedItem(null);
            deleteSessionFromDb(user.id, selectedItem.session_id);
        }
        onDeleteOpenChange(false);
    };

    const viewPlan = (item) => {
        setSelectedItem(item);
        onViewOpen();
    };

    const legend = () => {
        return (
            <div className='p-4 w-fit bg-slate-200 rounded-lg'>
                <p className='flex gap-2'><IconEdit className='edit-icon' /> - Edit</p>
                <p className='flex gap-2'><IconTrash className='delete-icon' /> - Delete</p>
                <p className='flex gap-2'><IconShare className='share-icon' /> - Share</p>
                <p className='flex gap-2'><IconEye className='view-icon' /> - View</p>
                <p className='flex gap-2'><IconWand className='quote-icon' /> - Get Quote</p>
            </div>
        )
    }

    const toastRef = useRef(null);

    const handleToast = () => {
        startTransition(() => {
            if (toastRef.current) {
                // Dismiss the toast and reset state
                toast.dismiss(toastRef.current);
                toastRef.current = null;
            }

            const newToastId = toast.custom((t) => (
                <div className="relative flex justify-end">
                    <div className='w-fit relative'>
                        <Button
                            className='!absolute -top-4 -left-9 p-2'
                            onPress={() => {
                                toast.dismiss(t)
                                toastRef.current = null;
                                Cookies.set('toastDismissed', true, { expires: 365 });
                            }}
                        >
                            <IconSquareRoundedXFilled className='bg-white text-primary rounded-lg' />
                        </Button>
                        {legend()}
                    </div>
                </div>
            ), {
                duration: Infinity,
                onDismiss: () => {
                    toastRef.current = null;
                }
            });

            toastRef.current = newToastId;
        });
    };

    useEffect(() => {
        // Check if the toast has been dismissed
        const dismissed = Cookies.get('toastDismissed');

        if (dismissed) return;

        const timeout = setTimeout(() => {
            handleToast();
        }, 500); // Small delay to allow context and DOM readiness

        return () => clearTimeout(timeout); // Cleanup on unmount
    }, []);

    if (isPending || loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner color="primary" />
            </div>
        );
    }

    const handleEdit = (item) => {

        startTransition(async () => {
            try {
                logger.info(`Edit item with ID: ${item.session_id}`);
                await initSessionFromDb(user.id, item.session_id); // Wait for the session initialization
                router.push(`/website-planner`); // Redirect after completion
            } catch (error) {
                logger.error("Error during session initialisation:", error);
            }
        });
    };

    const formatDateToLocalBasic = (timestampz) => {
        if (!timestampz) return 'N/A'; // Handle missing or invalid timestampz

        const date = new Date(timestampz); // Convert the timestampz to a Date object
        return date.toLocaleString(); // Format it to the user's local timezone and locale
    };

    const formatDateToLocal = (timestampz) => {
        if (!timestampz) return 'N/A';

        const date = new Date(timestampz);
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short',
        });
    };


    return (
        <div className="p-4 max-w-xl mx-auto overflow-hidden">
            <div className='w-full flex justify-end my-4 text-primary'>
                <Button
                    onPress={() => handleToast()}
                >
                    <IconInfoCircleFilled className='info-icon' />
                </Button>
            </div>
            <Reorder.Group
                axis="y"
                className="space-y-2"
                values={items}
                onReorder={setItems}
            >
                {items.length === 0 &&
                    <div className="flex items-center justify-center h-96">
                        <p className="text-gray-500">No items found.</p>
                    </div>
                }
                {items.length > 0 &&
                    <AnimatePresence>
                        {items.map(item => {

                            logger.debug('Item:', item.session_title);

                            return (
                                <Reorder.Item
                                    key={item?.session_id}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-content1 shadow-md p-4 rounded-md flex justify-between items-center"
                                    drag={false}
                                    exit={{ opacity: 0, x: 100 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    value={item}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className='select-none'>
                                        <h2 className="font-semibold">{item.session_title}</h2>
                                        <p className="text-sm text-gray-500">
                                            Created: {formatDateToLocalBasic(item.created_at)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Updated: {formatDateToLocalBasic(item.updated_at)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className='grid grid-cols-2 gap-3 md:flex md:gap-2'>
                                            <Button
                                                className="btn btn-primary btn-sm"
                                                onPress={() => handleEdit(item)}
                                            >
                                                <IconEdit className='edit-icon' />
                                                <Tooltip anchorSelect=".edit-icon" place="top">
                                                    Edit
                                                </Tooltip>
                                            </Button>
                                            <Button
                                                className="btn btn-warning btn-sm"
                                                onPress={() => confirmDelete(item)}
                                            >
                                                <IconTrash className='delete-icon' />
                                                <Tooltip anchorSelect=".delete-icon" place="top">
                                                    Delete
                                                </Tooltip>
                                            </Button>
                                            <Button
                                                className="btn btn-secondary btn-sm"
                                                onPress={() => logger.info(`Share item with ID: ${item.session_id}`)}
                                            >
                                                <IconShare className='share-icon' />
                                                <Tooltip anchorSelect=".share-icon" place="top">
                                                    Share
                                                </Tooltip>
                                            </Button>
                                            <Button
                                                className="btn btn-info btn-sm"
                                                onPress={() => viewPlan(item)}
                                            >
                                                <IconEye className='view-icon' />
                                                <Tooltip anchorSelect=".view-icon" place="top">
                                                    View
                                                </Tooltip>
                                            </Button>
                                        </div>
                                        <Button
                                            className="btn btn-success btn-sm"
                                            onPress={() => logger.info(`Submit for quote: ${item.session_id}`)}
                                        >
                                            <IconWand className='quote-icon' />
                                            <Tooltip anchorSelect=".quote-icon" place="top">
                                                Get Quote
                                            </Tooltip>
                                        </Button>
                                    </div>
                                </Reorder.Item>
                            )
                        })}
                    </AnimatePresence>
                }
            </Reorder.Group>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onOpenChange={onDeleteOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
                            <ModalBody>
                                <p>
                                    Are you sure you want to delete{' '}
                                    <span className="font-semibold">{selectedItem?.title}</span>? This action cannot be undone.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleDelete}>
                                    Confirm
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* View Plan Modal */}
            <Modal isOpen={isViewModalOpen} onOpenChange={onViewOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">View Plan</ModalHeader>
                            <ModalBody>
                                <h2 className="text-lg font-semibold">{selectedItem?.title}</h2>
                                <p className="mt-4 text-gray-700">{selectedItem?.content}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" onPress={onClose}>
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

        </div>
    );
}
