import { Star } from 'lucide-react';
import { reviews } from '../data/menuData';

const extended = [
  ...reviews,
  { id: 'r5', rating: 5, text: '"Ordered the Truffle Pink Penne and it was absolutely divine. Restaurant quality at home prices!"', author: '- Priya S.' },
  { id: 'r6', rating: 4, text: '"The cold brew is something else. Cannot get enough of it. Will be ordering every single day."', author: '- Nikita P.' },
  { id: 'r7', rating: 5, text: '"Finally, a cloud kitchen that actually delivers on quality. The packaging is premium too!"', author: '- Neha R.' },
  { id: 'r8', rating: 5, text: '"Masala Maggi brought back childhood memories but elevated. Highly recommend to everyone."', author: '- Kabir D.' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14} className={i <= Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-stone-200 fill-stone-100'} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const avg = (extended.reduce((s, r) => s + r.rating, 0) / extended.length).toFixed(1);

  return (
    <div className="min-h-screen bg-[#fefce8]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-5xl font-bold text-stone-900 mb-3">What Our Foodies Say</h1>
          <p className="text-stone-500 mb-6">Real reviews from real customers who love their food.</p>
          <div className="inline-flex items-center gap-3 bg-white border border-amber-100 rounded-2xl px-6 py-3 shadow-sm">
            <span className="font-playfair text-4xl font-bold text-stone-900">{avg}</span>
            <div>
              <StarRating rating={parseFloat(avg)} />
              <p className="text-xs text-stone-400 mt-1">{extended.length} verified reviews</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {extended.map(review => (
            <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-50 hover:shadow-md transition-shadow">
              <StarRating rating={review.rating} />
              <p className="text-stone-600 text-sm mt-3 leading-relaxed italic">{review.text}</p>
              <p className="text-stone-400 text-xs mt-3 font-medium">{review.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
