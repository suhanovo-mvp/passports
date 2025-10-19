import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const { data: passports, isLoading: passportsLoading } = trpc.passports.list.useQuery();
  const { data: users, isLoading: usersLoading } = trpc.users.list.useQuery();

  const stats = [
    {
      title: "Всего паспортов",
      value: passports?.length || 0,
      icon: FileText,
      description: "Технологических паспортов",
      loading: passportsLoading,
    },
    {
      title: "В работе",
      value: passports?.filter(p => p.status === "draft" || p.status === "in_review").length || 0,
      icon: TrendingUp,
      description: "Паспортов в разработке",
      loading: passportsLoading,
    },
    {
      title: "Опубликовано",
      value: passports?.filter(p => p.status === "published").length || 0,
      icon: FileText,
      description: "Готовых паспортов",
      loading: passportsLoading,
    },
    {
      title: "Пользователей",
      value: users?.length || 0,
      icon: Users,
      description: "Активных пользователей",
      loading: usersLoading,
    },
  ];

  const recentPassports = passports?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Добро пожаловать, {user?.name || "Пользователь"}!</h1>
            <p className="text-muted-foreground mt-1">
              Система создания технологических паспортов услуг социальной поддержки
            </p>
          </div>
          {(user?.role === "curator" || user?.role === "admin") && (
            <Link href="/passports/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Создать паспорт
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.loading ? "..." : stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Passports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Последние паспорта</CardTitle>
                <CardDescription>Недавно обновленные технологические паспорты</CardDescription>
              </div>
              <Link href="/passports">
                <Button variant="outline" size="sm">
                  Все паспорта
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {passportsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
            ) : recentPassports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Паспорты не найдены. Создайте первый паспорт!
              </div>
            ) : (
              <div className="space-y-4">
                {recentPassports.map((passport) => (
                  <Link key={passport.id} href={`/passports/${passport.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex-1">
                        <h3 className="font-medium">{passport.serviceName}</h3>
                        {passport.serviceCode && (
                          <p className="text-sm text-muted-foreground">Код: {passport.serviceCode}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            passport.status === "published"
                              ? "bg-green-100 text-green-800"
                              : passport.status === "in_review"
                              ? "bg-blue-100 text-blue-800"
                              : passport.status === "archived"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {passport.status === "published"
                            ? "Опубликован"
                            : passport.status === "in_review"
                            ? "На проверке"
                            : passport.status === "archived"
                            ? "Архивирован"
                            : "Черновик"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          v{passport.version}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Часто используемые функции</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/passports">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <FileText className="w-6 h-6" />
                  <span>Все паспорта</span>
                </Button>
              </Link>
              {(user?.role === "curator" || user?.role === "admin") && (
                <Link href="/passports/new">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <Plus className="w-6 h-6" />
                    <span>Создать паспорт</span>
                  </Button>
                </Link>
              )}
              {user?.role === "admin" && (
                <Link href="/users">
                  <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                    <Users className="w-6 h-6" />
                    <span>Управление пользователями</span>
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

