import { toast } from "sonner";
import { marked } from "marked";

import logger from "@/lib/logger";



export const sendSessionToPlanfix = async (user, sessionId, fetchSessionFromDb, token) => {

    try {
        // Fetch session details
        const session = await fetchSessionFromDb(user.id, sessionId);

        if (!session) {
            toast.error("Failed to fetch session data.", {
                classNames: { toast: "text-danger" },
            });

            return;
        }

        // Extract required fields from form_data and ai_generated_plan
        const formData = session.form_data;
        const i = 9; // Get the section from formData where contact details are
        const aiGeneratedPlan = session.ai_generated_plan;
        const title = session.session_title;

        logger.debug("title", title);
        logger.debug("title type", typeof title);

        const contactDetails = {
            firstName: formData[i]?.firstname || "",
            lastName: formData[i]?.lastname || "",
            email: formData[i]?.emailaddress || "",
            phone: formData[i]?.phonenumber || "",
            organisation: formData[i]?.organisation || "Unknown",
            message: `<h1>${title}</h1>${marked(aiGeneratedPlan || "")}` || "",
            token,
        };

        if (!aiGeneratedPlan || aiGeneratedPlan === null || aiGeneratedPlan === "" || aiGeneratedPlan?.length < 150) {
            // log all condition
            //logger.debug("aiGeneratedPlan", aiGeneratedPlan);
            logger.debug("aiGeneratedPlan type", typeof aiGeneratedPlan);
            logger.debug("aiGeneratedPlan length", aiGeneratedPlan?.length);
            


            toast.error("Your planning isn't complete yet, and no website plan is available. Please finish the planning to proceed.", {
                classNames: { toast: "text-danger" }, closeButton: true,  duration: 10000
            });

            return;
        }

        // Ensure all required fields are present
        if ( !contactDetails.firstName || !contactDetails.lastName || !contactDetails.email) {
            toast.error("Missing required contact details.", {
                classNames: { toast: "text-danger" },
            });

            return;
        }

        // Send data to the API
        const res = await fetch("/api/planfixContact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(contactDetails),
        });

        const result = await res.json();

        if (res.ok) {
            toast.success("Quote request sent successfully! We'll get back to you shortly.", {
                classNames: { toast: "text-green-600" },
              });
        } else {
            toast.error(`Error: ${result.message || "Failed to send data."}`,{
                classNames: { toast: "text-danger" },
            });
        }
    } catch (error) {
        logger.error("Error sending session to Planfix:", error.message);
        toast.error("Failed to send quote request.", {
            classNames: { toast: "text-danger" },
        });
    }
};

export default sendSessionToPlanfix;