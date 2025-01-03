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
    Link,
    useDisclosure,
} from "@nextui-org/react";
import { IconEdit, IconTrash, IconEye, IconShare, IconWand, IconSquareRoundedXFilled, IconInfoCircleFilled, IconPencilStar } from '@tabler/icons-react';
import { Tooltip } from 'react-tooltip';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Spinner } from "@nextui-org/react";

import { createOrUpdateProfile } from "@/lib/supabaseClient";
import logger from '@/lib/logger';
import { useAuth } from '@/lib/AuthContext';

import { useSessionContext } from '@/lib/SessionProvider';
import ReactMarkdown from 'react-markdown';

export default function UserActivities() {

    const { fetchAllSessionsFromDb, deleteSessionFromDb, initSessionFromDb, fetchAiGeneratedPlanFromDb, updateSessionTitleInDb } = useSessionContext();
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteOpenChange } = useDisclosure();
    const { isOpen: isViewModalOpen, onOpen: onViewOpen, onOpenChange: onViewOpenChange } = useDisclosure();
    const [isPending, startTransition] = useTransition();
    const { user, loading } = useAuth(); // Access user state
    const router = useRouter();

    const [selectedAiGenPlan, setSelectedAiGenPlan] = useState({});
    const inputRefs = useRef({});

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

    const viewPlan = async (item) => {
        setSelectedItem(item);  // Open the modal immediately
        setSelectedAiGenPlan((prevState) => ({
            ...prevState,
            [item.session_id]: "Loading..."
        }));
        onViewOpen();

        try {
            logger.info(`Fetching AI-generated plan for sessionId: ${item.session_id}`);
            const generatedPlanFromDb = await fetchAiGeneratedPlanFromDb(item.session_id);

            setSelectedAiGenPlan((prevState) => ({
                ...prevState,
                [item.session_id]: generatedPlanFromDb || "No AI-generated plan available."
            }));
            logger.info('AI-generated plan fetched successfully.');
        } catch (error) {
            setSelectedAiGenPlan((prevState) => ({
                ...prevState,
                [item.session_id]: "Error loading plan."
            }));
            logger.error('Error fetching AI-generated plan:', error.message);
        }
    };


    const legend = () => {
        return (
            <div className='p-4 w-fit bg-slate-200 rounded-lg'>
                <p className='flex gap-2'><IconEdit /> - Edit</p>
                <p className='flex gap-2'><IconTrash /> - Delete</p>
                <p className='flex gap-2'><IconShare /> - Share</p>
                <p className='flex gap-2'><IconEye /> - View</p>
                <p className='flex gap-2'><IconWand /> - Get Quote</p>
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

    const handleEditTitle = async (item, newTitle) => {
        if (!newTitle.trim()) {
            toast.dismiss();
            toast.error("Title cannot be empty.");
            return;
        }

        try {
            const updatedItems = items.map(i =>
                i.session_id === item.session_id
                    ? { ...i, session_title: newTitle, isEditing: false } // Set isEditing to false after update
                    : i
            );
            setItems(updatedItems); // Update state immediately for UX 

            await updateSessionTitleInDb(user.id, item.session_id, newTitle); // Update DB
            toast.dismiss();
            toast.success("Title updated successfully!", { classNames: { toast: 'text-green-600' }, });
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to update the title.");
            logger.error('Error updating title:', error.message);
        }
    };

    const startEditingTitle = (item) => {
        // Enable editing and set focus
        const updatedItems = items.map(i =>
            i.session_id === item.session_id ? { ...i, isEditing: true } : i
        );
        setItems(updatedItems);

        setTimeout(() => {
            inputRefs.current[item.session_id]?.focus(); // Focus the correct input
        }, 0);
    };


    return (
        <div className="p-4 max-w-2xl mx-auto overflow-hidden">
            <div className='w-full flex justify-end my-4 text-primary'>
                <Button
                    onPress={() => handleToast()}
                >
                    <IconInfoCircleFilled className='info-icon' />
                </Button>
            </div>
            <Reorder.Group
                axis="y"
                className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4"
                values={items}
                onReorder={setItems}
            >
                {items.length === 0 &&
                    <div className="flex items-center justify-center h-96">
                        <p className="text-gray-500">No items found.</p>
                    </div>
                }
                {items.length > 0 &&
                    <AnimatePresence className="">
                        {items.map(item => {

                            logger.debug('Item:', item);

                            return (
                                <Reorder.Item
                                    key={item?.session_id}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-content1 shadow-md p-4 rounded-md flex flex-col items-center gap-4 select-none"
                                    drag={false}
                                    exit={{ opacity: 0, x: 100 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    value={item}
                                    whileTap={{ scale: 0.95 }}
                                >

                                    <div className='relative w-fit py-4'>
                                        {item.isEditing ? (
                                            <input
                                                ref={(el) => (inputRefs.current[item.session_id] = el)} // Assign dynamic ref
                                                type="text"
                                                value={item.session_title}
                                                onChange={(e) => {
                                                    const updatedItems = items.map(i =>
                                                        i.session_id === item.session_id
                                                            ? { ...i, session_title: e.target.value }
                                                            : i
                                                    );
                                                    setItems(updatedItems); // Live update in state for better UX
                                                }}
                                                onBlur={() => handleEditTitle(item, item.session_title)} // Stop editing when blurred
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleEditTitle(item, item.session_title); // Stop editing on Enter key press
                                                    }
                                                }}
                                                className="border p-2 rounded-md"
                                            />
                                        ) : (
                                            <div>
                                                <h2 className="font-semibold">{item.session_title}</h2>
                                                <Link
                                                    className="text-primary absolute w-4 h-4 -right-5 top-2"
                                                    onPress={() => {
                                                        startEditingTitle(item)
                                                    }}
                                                >
                                                    <IconPencilStar id="edit-title" />
                                                </Link>
                                                <Tooltip anchorSelect="#edit-title" place="top">
                                                    Edit Title
                                                </Tooltip>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 w-full">
                                        <div className='flex w-full justify-around'>
                                            <div>
                                                <Link
                                                    className="text-white"
                                                    onPress={() => handleEdit(item)}
                                                >
                                                    <IconEdit id="edit-icon" />
                                                </Link>
                                                <Tooltip anchorSelect="#edit-icon" place="top">
                                                    Edit
                                                </Tooltip>
                                            </div>
                                            <div>
                                                <Link
                                                    className="text-white"
                                                    onPress={() => confirmDelete(item)}
                                                >
                                                    <IconTrash id='delete-icon' />
                                                </Link>
                                                <Tooltip anchorSelect="#delete-icon" place="top">
                                                    Delete
                                                </Tooltip>
                                            </div>
                                            <div>
                                                <Link
                                                    className="text-white"
                                                    onPress={() => logger.info(`Share item with ID: ${item.session_id}`)}
                                                >
                                                    <IconShare id='share-icon' />
                                                </Link>
                                                <Tooltip anchorSelect="#share-icon" place="top">
                                                    Share
                                                </Tooltip>
                                            </div>
                                            <div>
                                                <Link
                                                    className="text-white"
                                                    onPress={() => viewPlan(item)}
                                                >
                                                    <IconEye id='view-icon' />
                                                </Link>
                                                <Tooltip anchorSelect="#view-icon" place="top">
                                                    View
                                                </Tooltip>
                                            </div>
                                            <div>
                                                <Link
                                                    alt="Get Quote"
                                                    className="text-white"
                                                    onPress={() => logger.info(`Submit for quote: ${item.session_id}`)}
                                                >
                                                    <IconWand id='quote-icon' />
                                                </Link>
                                                <Tooltip anchorSelect="#quote-icon" place="top">
                                                    Get Quote
                                                </Tooltip>
                                            </div>
                                        </div>

                                    </div>
                                    <div className='flex justify-around w-full'>
                                        <p className="text-sm text-gray-500">
                                            Created: {formatDateToLocalBasic(item.created_at)}
                                        </p>
                                        <p className="text-sm text-right text-gray-500">
                                            Updated: {formatDateToLocalBasic(item.updated_at)}
                                        </p>
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
                                    <span className="font-semibold">{selectedItem?.session_title}</span>? This action cannot be undone.
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

            { }
            <Modal
                isOpen={isViewModalOpen}
                onOpenChange={onViewOpenChange}
                className="max-w-4xl p-8 mx-auto top-0" // Ensure modal is properly centered and within viewport
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            {/* Ensure Header Stays Fixed */}
                            <ModalHeader className="flex flex-col gap-1 sticky top-0 z-10 shadow-md">
                                View Plan
                            </ModalHeader>

                            {/* Enable Scrolling for Content */}
                            <ModalBody className="overflow-y-auto max-h-[70vh]">
                                <h2 className="text-lg font-semibold">{selectedItem?.session_title}</h2>
                                {/* Conditional Rendering for Spinner or Content */}
                                {selectedAiGenPlan[selectedItem?.session_id] === "Loading..."
                                    ? <Spinner color="primary" />
                                    : <ReactMarkdown>{selectedAiGenPlan[selectedItem?.session_id]}</ReactMarkdown>
                                }
                            </ModalBody>

                            {/* Footer Fixed at Bottom */}
                            <ModalFooter className="sticky bottom-0 z-10 shadow-md">
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
