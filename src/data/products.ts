// import type { Product } from '../@types/products.type'

// export const SAMPLE_PRODUCTS: Product[] = [
//   {
//     id: 1,
//     title: 'OnePlus Nord N30 5G | Unlocked Dual-SIM Android Smart Phone | 6.7" LCD Display',
//     sku: 'HY5480',
//     stock: 25,
//     price: 253,
//     category: 'Electronics',
//     type: 'Goods',
//     tags: ['Top rated', 'Best', 'Popular', 'Phone'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 2,
//     title: 'Socket Mobile Charging Dock',
//     sku: 'E5480',
//     stock: 25,
//     price: 50.5,
//     category: 'Electronics',
//     type: 'Goods',
//     tags: ['Top rated', 'Popular'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 3,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 0,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 4,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 5,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 5,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 0,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 6,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 0,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 7,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 2,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 8,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 0,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 9,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 0,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 10,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 0,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 11,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 0,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 12,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 0,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   },
//   {
//     id: 13,
//     title: 'Mielle Organics Rosemary Mint Scalp & Hair Strengthening Oil',
//     sku: 'XZ25',
//     stock: 0,
//     price: 9.2,
//     category: 'Beauty',
//     type: 'Goods',
//     tags: ['Natural'],
//     rating: 4.2,
//     date: '03/12/2023'
//   }
// ]
import type { ProductResponse } from '../@types/product.schema'

export const SAMPLE_PRODUCTS: ProductResponse[] = [
  {
    id: 1,
    name: 'Nhẫn vàng 18K đính kim cương',
    code: 'NV18K001',
    category_id: 1,
    weight: 3.5,
    gold_price_at_time: 5600000,
    labor_cost: 500000,
    stone_cost: 2000000,
    markup_rate: 15,
    selling_price: 9000000,
    warranty_period: 12,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiu8IOCNccPGcgT15zbsAhaqUNgEm7dQFMQP8gPx8psKN96x1jPnS7lFIEtwvXDxvFU44&usqp=CAU',
    created_at: '2023-12-03',
    updated_at: '2023-12-05'
  },
  {
    id: 2,
    name: 'Lắc tay vàng 24K',
    code: 'LT24K002',
    category_id: 2,
    weight: 5.2,
    gold_price_at_time: 5900000,
    labor_cost: 600000,
    stone_cost: 0,
    markup_rate: 10,
    selling_price: 11500000,
    warranty_period: 24,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiu8IOCNccPGcgT15zbsAhaqUNgEm7dQFMQP8gPx8psKN96x1jPnS7lFIEtwvXDxvFU44&usqp=CAU',
    created_at: '2023-12-04',
    updated_at: '2023-12-06'
  },
  {
    id: 3,
    name: 'Dây chuyền vàng trắng 14K',
    code: 'DC14K003',
    category_id: 3,
    weight: 2.8,
    gold_price_at_time: 4800000,
    labor_cost: 450000,
    stone_cost: 1500000,
    markup_rate: 20,
    selling_price: 7500000,
    warranty_period: 6,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiu8IOCNccPGcgT15zbsAhaqUNgEm7dQFMQP8gPx8psKN96x1jPnS7lFIEtwvXDxvFU44&usqp=CAU',
    created_at: '2023-12-05',
    updated_at: '2023-12-07'
  }
]
