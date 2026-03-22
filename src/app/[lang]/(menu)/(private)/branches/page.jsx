import { Suspense } from 'react'

import BranchesCourtsTabs from '@/views/branches-courts/BranchesCourtsTabs'
import { getDictionary } from '@/utils/getDictionary'

function VenuesTabsFallback() {
  return (
    <div className='flex flex-col gap-4 p-2'>
      <div className='h-10 max-w-sm animate-pulse rounded bg-actionHover' />
      <div className='h-48 animate-pulse rounded bg-actionHover' />
    </div>
  )
}

const BranchesPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Suspense fallback={<VenuesTabsFallback />}>
      <BranchesCourtsTabs dictionary={dictionary} />
    </Suspense>
  )
}

export default BranchesPage
