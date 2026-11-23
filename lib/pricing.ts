export type PlanSeed = {
  slug: string;
  name: string;
  description: string | null;
  price: number;
  interval: string;
  features: string[];
  maxUsers: number | null;
  isPopular: boolean;
};

/**
 * Satu sumber untuk seed database dan fallback halaman publik.
 * Harga dalam Rupiah penuh (bukan sen).
 */
export const DEFAULT_PLANS: PlanSeed[] = [
  {
    slug: "free",
    name: "Free",
    description: "Untuk mencoba alur auth dan dashboard.",
    price: 0,
    interval: "month",
    features: ["1 pengguna", "1 workspace", "Klien & tugas", "Invoice dasar"],
    maxUsers: 1,
    isPopular: false,
  },
  {
    slug: "pro",
    name: "Pro",
    description: "Untuk SaaS yang mulai berjalan.",
    price: 149_000,
    interval: "month",
    features: [
      "10 pengguna",
      "Kontak PIC & timeline",
      "Invoice + pajak",
      "Tanda tangan via link",
    ],
    maxUsers: 10,
    isPopular: true,
  },
  {
    slug: "business",
    name: "Business",
    description: "Untuk tim dengan kebutuhan operasional penuh.",
    price: 499_000,
    interval: "month",
    features: [
      "Pengguna tanpa batas",
      "Semua fitur Pro",
      "Akses semua modul",
      "Prioritas dukungan",
    ],
    maxUsers: null,
    isPopular: false,
  },
];

export function formatPrice(price: number): string {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}
