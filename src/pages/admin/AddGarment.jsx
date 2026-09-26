import { useEffect, useState } from "react";
import { uploadImage } from "../../utils/uploadImage";

export default function AddGarment() {
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState("");

    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
        };
    }, [imagePreview]);

    const handleImageChange = (event) => {
        const selectedImage = event.target.files?.[0] || null;
        setImage(selectedImage);
        setImagePreview(selectedImage ? URL.createObjectURL(selectedImage) : "");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!image) {
            alert("Please select an image");
            return;
        }

        try {
            setLoading(true);

            // 1. Upload image to Cloudinary
            const imageUrl = await uploadImage(image);

            // 2. Send image URL with the garment data
            const response = await fetch("/api/garments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: event.target.name.value,
                    category: event.target.category.value,
                    price: Number(event.target.price.value),
                    image: imageUrl,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create garment");
            }

            alert("Garment added successfully");
            event.target.reset();
            setImage(null);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>

            <input name="name" placeholder="Garment name" required />
            <input name="category" placeholder="Category" required />
            <input name="price" type="number" placeholder="Price" required />

            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
            />

            {imagePreview ? (
                <img src={imagePreview} alt="Garment preview" width="180" />
            ) : null}

            <button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Add Garment"}
            </button>
        </form>
    );
}