import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { FileText, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function PassportList() {
  const { user } = useAuth();
  const { data: passports, isLoading } = trpc.passports.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPassports = passports?.filter((passport) => {
    const query = searchQuery.toLowerCase();
    return (
      passport.serviceName.toLowerCase().includes(query) ||
      passport.serviceCode?.toLowerCase().includes(query) ||
      passport.description?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-yellow-100 text-yellow-800",
      in_review: "bg-blue-100 text-blue-800",
      published: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800",
    };

    const labels = {
      draft: "Черновик",
      in_review: "На проверке",
      published: "Опубликован",
      archived: "Архивирован",
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Технологические паспорта</h1>
            <p className="text-muted-foreground mt-1">
              Управление паспортами процессов оказания мер социальной поддержки
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

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск по названию, коду или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Passports List */}
        <Card>
          <CardHeader>
            <CardTitle>Список паспортов</CardTitle>
            <CardDescription>
              {filteredPassports?.length || 0} паспорт(ов) найдено
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Загрузка паспортов...
              </div>
            ) : filteredPassports?.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Паспорты не найдены</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Попробуйте изменить параметры поиска"
                    : "Создайте первый технологический паспорт"}
                </p>
                {(user?.role === "curator" || user?.role === "admin") && !searchQuery && (
                  <Link href="/passports/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Создать паспорт
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPassports?.map((passport) => (
                  <Link key={passport.id} href={`/passports/${passport.id}`}>
                    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{passport.serviceName}</h3>
                          {getStatusBadge(passport.status)}
                        </div>
                        {passport.serviceCode && (
                          <p className="text-sm text-muted-foreground">
                            Код услуги: {passport.serviceCode}
                          </p>
                        )}
                        {passport.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {passport.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Версия: {passport.version}</span>
                          {passport.updatedAt && (
                            <span>
                              Обновлен: {format(new Date(passport.updatedAt), "dd.MM.yyyy HH:mm")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

