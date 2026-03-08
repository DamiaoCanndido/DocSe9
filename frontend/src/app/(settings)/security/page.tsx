import SecurityForm from '@/components/SecurityForm';

const SecurityPage = () => {
  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Segurança
      </h2>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 lg:p-8">
        <div className="mb-8">
          <p className="text-gray-500 dark:text-zinc-400">
            Atualize sua senha para manter sua conta segura. Recomendamos o uso
            de uma senha forte que você não use em outros sites.
          </p>
        </div>

        <SecurityForm />
      </div>
    </div>
  );
};

export default SecurityPage;
