import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants'
import { getUserById } from '@/lib/actions/user.actions';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const AddTransformationTypePage = async ({ params: { type } }: SearchParamProps) => {
  const { userId } = auth();
  const transformation = transformationTypes[type];

  if(!userId) redirect('/sign-in')

  let user = null;
  try {
    user = await getUserById(userId);
  } catch (error) {
    // Option 1: Show a friendly message
    return <div>User not found. Please contact support or sign up.</div>;
    // Option 2: Redirect to sign up
    // redirect('/sign-up');
  }
  if (!user) {
    return <div>User not found. Please contact support or sign up.</div>;
    // Or: redirect('/sign-up');
  }

  return (
    <>
      <Header 
        title={transformation.title}
        subtitle={transformation.subTitle}
      />
    
      <section className="mt-10">
        <TransformationForm 
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  )
}

export default AddTransformationTypePage