import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to default brand storefront
  redirect('/grit-collective')
}
