import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import {
  ArrowLeft,
  FileText,
  GitBranch,
  MessageSquare,
  Settings,
  Workflow,
} from "lucide-react";
import { useLocation, useRoute } from "wouter";

export default function PassportDetail() {
  const [, params] = useRoute("/passports/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const passportId = params?.id ? parseInt(params.id) : 0;

  const { data: passport, isLoading } = trpc.passports.get.useQuery(
    { id: passportId },
    { enabled: passportId > 0 }
  );

  const { data: sections } = trpc.sections.list.useQuery(
    { passportId },
    { enabled: passportId > 0 }
  );

  const { data: bpmn } = trpc.bpmn.list.useQuery(
    { passportId },
    { enabled: passportId > 0 }
  );

  const { data: criteria } = trpc.criteria.list.useQuery(
    { passportId },
    { enabled: passportId > 0 }
  );

  const { data: formulas } = trpc.formulas.list.useQuery(
    { passportId },
    { enabled: passportId > 0 }
  );

  const { data: statuses } = trpc.statuses.list.useQuery(
    { passportId },
    { enabled: passportId > 0 }
  );

  const { data: notifications } = trpc.notifications.list.useQuery(
    { passportId },
    { enabled: passportId > 0 }
  );

  const { data: smev } = trpc.smev.list.useQuery(
    { passportId },
    { enabled: passportId > 0 }
  );

  const { data: comments } = trpc.comments.list.useQuery(
    { passportId },
    { enabled: passportId > 0 }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <div className="text-center py-12">Загрузка паспорта...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!passport) {
    return (
      <DashboardLayout>
        <div className="container py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Паспорт не найден</h2>
            <Button onClick={() => setLocation("/passports")}>
              Вернуться к списку
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
      <span className={`px-3 py-1 text-sm rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const sectionsList = [
    { number: 1, name: "Общие сведения" },
    { number: 2, name: "Генеральная схема процесса (BPMN)" },
    { number: 3, name: "Нормативные основания" },
    { number: 4, name: "Источники возникновения заявлений" },
    { number: 5, name: "Административные процедуры" },
    { number: 6, name: "Оценка права (матрица критериев)" },
    { number: 7, name: "Вынесение решения" },
    { number: 8, name: "Статусные модели" },
    { number: 9, name: "Уведомления и коммуникации" },
    { number: 10, name: "Технические разделы" },
  ];

  return (
    <DashboardLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/passports")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{passport.serviceName}</h1>
                {getStatusBadge(passport.status)}
              </div>
              {passport.serviceCode && (
                <p className="text-muted-foreground">Код услуги: {passport.serviceCode}</p>
              )}
              {passport.description && (
                <p className="text-muted-foreground mt-2">{passport.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>Версия: {passport.version}</span>
                {passport.updatedAt && (
                  <span>
                    Обновлен: {format(new Date(passport.updatedAt), "dd.MM.yyyy HH:mm")}
                  </span>
                )}
              </div>
            </div>
            {(user?.role === "curator" || user?.role === "admin") && (
              <Button>
                <Settings className="w-4 h-4 mr-2" />
                Настройки
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="sections">Разделы</TabsTrigger>
            <TabsTrigger value="bpmn">BPMN</TabsTrigger>
            <TabsTrigger value="criteria">Критерии</TabsTrigger>
            <TabsTrigger value="formulas">Формулы</TabsTrigger>
            <TabsTrigger value="statuses">Статусы</TabsTrigger>
            <TabsTrigger value="comments">Комментарии</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Разделы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{sections?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {sections?.filter(s => s.isCompleted).length || 0} завершено
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">BPMN диаграммы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{bpmn?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Схемы процессов</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Комментарии</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{comments?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Обсуждений</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Статистика по компонентам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Критерии</p>
                    <p className="text-2xl font-bold">{criteria?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Формулы</p>
                    <p className="text-2xl font-bold">{formulas?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Статусы</p>
                    <p className="text-2xl font-bold">{statuses?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Уведомления</p>
                    <p className="text-2xl font-bold">{notifications?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections">
            <Card>
              <CardHeader>
                <CardTitle>Разделы паспорта</CardTitle>
                <CardDescription>10 основных разделов технологического паспорта</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sectionsList.map((section) => {
                    const sectionData = sections?.find(s => s.sectionNumber === section.number);
                    return (
                      <div
                        key={section.number}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                            {section.number}
                          </div>
                          <div>
                            <h4 className="font-medium">{section.name}</h4>
                            {sectionData?.isCompleted && (
                              <p className="text-xs text-green-600">Завершен</p>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Редактировать
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BPMN Tab */}
          <TabsContent value="bpmn">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>BPMN диаграммы</CardTitle>
                    <CardDescription>Схемы бизнес-процессов</CardDescription>
                  </div>
                  <Button>
                    <Workflow className="w-4 h-4 mr-2" />
                    Добавить диаграмму
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bpmn?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>BPMN диаграммы не добавлены</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bpmn?.map((diagram) => (
                      <div key={diagram.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{diagram.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Тип: {diagram.type === "as-is" ? "Как есть" : "Как будет"}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Просмотр
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Criteria Tab */}
          <TabsContent value="criteria">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Матрица критериев</CardTitle>
                    <CardDescription>Критерии оценки права на получение услуги</CardDescription>
                  </div>
                  <Button>Добавить критерий</Button>
                </div>
              </CardHeader>
              <CardContent>
                {criteria?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Критерии не добавлены
                  </div>
                ) : (
                  <div className="space-y-3">
                    {criteria?.map((criterion) => (
                      <div key={criterion.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{criterion.criterionName}</h4>
                        <p className="text-sm text-muted-foreground">{criterion.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Formulas Tab */}
          <TabsContent value="formulas">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Формулы расчета</CardTitle>
                    <CardDescription>Формулы расчета размера выплат</CardDescription>
                  </div>
                  <Button>Добавить формулу</Button>
                </div>
              </CardHeader>
              <CardContent>
                {formulas?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Формулы не добавлены
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formulas?.map((formula) => (
                      <div key={formula.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{formula.formulaName}</h4>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {formula.formulaExpression}
                        </code>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statuses Tab */}
          <TabsContent value="statuses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Статусные модели</CardTitle>
                    <CardDescription>Жизненный цикл заявления</CardDescription>
                  </div>
                  <Button>
                    <GitBranch className="w-4 h-4 mr-2" />
                    Добавить статус
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {statuses?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Статусы не добавлены
                  </div>
                ) : (
                  <div className="space-y-3">
                    {statuses?.map((status) => (
                      <div key={status.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{status.statusName}</h4>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {status.statusCode}
                          </code>
                          {status.isInitial && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Начальный
                            </span>
                          )}
                          {status.isFinal && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Конечный
                            </span>
                          )}
                        </div>
                        {status.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {status.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Комментарии</CardTitle>
                    <CardDescription>Обсуждение паспорта</CardDescription>
                  </div>
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Добавить комментарий
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {comments?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Комментариев пока нет
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments?.map((comment) => (
                      <div key={comment.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                              U
                            </div>
                            <div>
                              <p className="text-sm font-medium">Пользователь</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt!), "dd.MM.yyyy HH:mm")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm">{comment.commentText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

