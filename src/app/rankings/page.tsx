import RankingsJsonLd from '@/components/RankingsJsonLd'
import RankingsView from '@/components/RankingsView'

export default function RankingsPage() {
  return (
    <>
      <RankingsJsonLd path="/rankings" />
      <RankingsView />
    </>
  )
}
