import { getRecentFiles } from '@/app/api/files';
import { getMe } from '@/app/api/users';
import { Star, HardDrive, ShieldCheck, Users, Building2 } from 'lucide-react';
import Link from 'next/link';
import { SuggestedCard, RecentFilesTable } from '@/components/DashboardItems';

export default async function Dashboard() {
  const currentUser: UserResProps = await getMe();

  const isAdmin = currentUser.role.name === 'admin';

  // Only try to fetch recent files if user has a town or is not a global admin
  // (Assuming global admins might not have files directly)
  const recentFilesResponse = isAdmin
    ? []
    : await getRecentFiles({ size: '10' });
  const recentFiles = recentFilesResponse?.data?.content || [];

  const suggestedFiles = recentFiles.slice(0, 4);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] overflow-y-auto">
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-normal text-[#1F1F1F]">
            Bem-vindo ao DocSeq, {currentUser.username}
          </h1>
          {isAdmin && (
            <p className="text-sm text-[#5F6368] mt-1">
              Você está acessando como Administrador Global.
            </p>
          )}
        </header>

        {/* Admin Dashboard variant if no files and is admin */}
        {isAdmin && recentFiles.length === 0 ? (
          <div className="space-y-8">
            <section className="p-12 bg-white rounded-2xl border border-[#E0E0E0] flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-[#1F1F1F] mb-2">
                Painel de Controle
              </h3>
              <p className="text-sm text-[#5F6368] max-w-md mx-auto">
                Como administrador, você pode gerenciar municípios, usuários e
                permissões do sistema.
              </p>
              <div className="flex flex-wrap gap-4 mt-8 justify-center">
                <Link
                  href="/admin-panel"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Gerenciar Sistema
                </Link>
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              <Link
                href="/admin-panel"
                className="bg-white p-6 rounded-2xl border border-[#E0E0E0] hover:shadow-md transition-all group"
              >
                <Users className="w-8 h-8 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-[#1F1F1F]">Usuários</h4>
                <p className="text-xs text-[#5F6368] mt-1">
                  Gerencie contas e permissões
                </p>
              </Link>
              <Link
                href="/admin-panel"
                className="bg-white p-6 rounded-2xl border border-[#E0E0E0] hover:shadow-md transition-all group"
              >
                <Building2 className="w-8 h-8 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-[#1F1F1F]">Municípios</h4>
                <p className="text-xs text-[#5F6368] mt-1">
                  Adicione ou edite prefeituras
                </p>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Suggested Section */}
            {suggestedFiles.length > 0 ? (
              <section className="mb-10">
                <h2 className="text-sm font-medium text-[#444746] mb-4 flex items-center gap-2">
                  Sugeridos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {suggestedFiles.map((file: NodeResProps) => (
                    <SuggestedCard
                      key={file.id}
                      file={file}
                      path="/dashboard"
                    />
                  ))}
                </div>
              </section>
            ) : (
              <section className="mb-10 p-12 bg-white rounded-2xl border border-dashed border-[#E0E0E0] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <HardDrive className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-[#1F1F1F] mb-1">
                  Comece a usar o DocSeq
                </h3>
                <p className="text-sm text-[#5F6368] max-w-xs">
                  Faça upload de documentos ou crie pastas para vê-los aqui.
                </p>
                <Link
                  href="/my-docs"
                  className="mt-4 text-sm font-medium text-blue-600 hover:underline"
                >
                  Ir para Meus Documentos
                </Link>
              </section>
            )}

            {/* Recent Files Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-[#444746] flex items-center gap-2">
                  Arquivos recentes
                </h2>
                {recentFiles.length > 0 && (
                  <Link
                    href="/recent"
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Ver tudo
                  </Link>
                )}
              </div>

              {recentFiles.length > 0 ? (
                <RecentFilesTable
                  files={recentFiles}
                  currentUser={currentUser}
                  path="/dashboard"
                />
              ) : (
                <div className="bg-white rounded-xl border border-[#E0E0E0] p-8 text-center shadow-sm">
                  <p className="text-sm text-[#5F6368]">
                    Nenhum arquivo recente encontrado.
                  </p>
                </div>
              )}
            </section>

            {/* Quick Links / Shortcuts */}
            <section className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-12">
              <Link
                href="/my-docs"
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E0E0E0] hover:shadow-md transition-shadow group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F1F1F]">
                    Meu Drive
                  </p>
                  <p className="text-[11px] text-[#5F6368]">
                    Acesse todos os seus arquivos
                  </p>
                </div>
              </Link>
              <Link
                href="/starred"
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E0E0E0] hover:shadow-md transition-shadow group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F1F1F]">
                    Favoritos
                  </p>
                  <p className="text-[11px] text-[#5F6368]">
                    Arquivos importantes marcados
                  </p>
                </div>
              </Link>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
