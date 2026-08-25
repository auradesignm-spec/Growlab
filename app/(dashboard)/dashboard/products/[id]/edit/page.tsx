import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/dashboard/ProductForm";
import { productTags, productVariants } from "@/lib/catalog-db";

export const metadata: Metadata = {
  title: "Growlab — تعديل منتج",
};

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const viewer = await getCurrentUser();
  if (!viewer || viewer.role !== "merchant" || !viewer.merchantProfile) {
    redirect("/enter?role=merchant");
  }
  if (viewer.merchantProfile.verificationStatus !== "verified") {
    redirect("/dashboard");
  }

  const product = await prisma.product.findFirst({
    where: { id: params.id, merchantId: viewer.merchantProfile.id },
  });
  if (!product) notFound();

  return (
    <main className="px-5 py-10 sm:px-8">
      <ProductForm
        initial={{
          productId: product.id,
          title: product.title,
          category: product.category,
          tags: productTags(product).join(", "),
          variants: productVariants(product).join(", "),
          slug: product.slug,
          shortDescription: product.shortDescription,
          descriptionHtml: product.descriptionHtml,
          basePrice: product.basePrice,
          costPrice: product.costPrice,
          commissionType: product.commissionType,
          commissionValue: product.commissionValue,
          deliveryDaysMax: product.deliveryDaysMax,
          shippingFee: Number((product as { shippingFee?: number }).shippingFee ?? 1.5),
        }}
      />
    </main>
  );
}
