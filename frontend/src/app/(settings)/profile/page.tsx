import { getMe } from '@/app/api/users';
import ProfileForm from '@/components/ProfileForm';

const ProfilePage = async () => {
  const currentUser: UserResProps = await getMe();

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Perfil
      </h2>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 lg:p-8">
        <div className="mb-8">
          <p className="text-gray-500 dark:text-zinc-400">
            Visualize e edite suas informações pessoais, como nome de usuário e
            e-mail.
          </p>
        </div>

        <ProfileForm user={currentUser} />
      </div>
    </div>
  );
};

export default ProfilePage;
