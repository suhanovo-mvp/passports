import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function PassportNew() {
  const [, setLocation] = useLocation();
  const [serviceName, setServiceName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = trpc.passports.create.useMutation({
    onSuccess: (data) => {
      toast.success("Паспорт успешно создан");
      setLocation(`/passports/${data.id}`);
    },
    onError: (error) => {
      toast.error("Ошибка при создании паспорта: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      toast.error("Введите название услуги");
      return;
    }
    createMutation.mutate({
      serviceName: serviceName.trim(),
      serviceCode: serviceCode.trim() || undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <DashboardLayout>
      <div className="container py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/passports")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
          <h1 className="text-3xl font-bold">Создание технологического паспорта</h1>
          <p className="text-muted-foreground mt-1">
            Заполните основную информацию о новом паспорте услуги
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
            <CardDescription>
              Укажите название услуги и краткое описание
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="serviceName">
                  Наименование услуги <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="serviceName"
                  placeholder="Например: Ежемесячная денежная выплата многодетным семьям"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceCode">Код услуги</Label>
                <Input
                  id="serviceCode"
                  placeholder="Например: MSP-001"
                  value={serviceCode}
                  onChange={(e) => setServiceCode(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Уникальный идентификатор услуги в системе
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Краткое описание</Label>
                <Textarea
                  id="description"
                  placeholder="Опишите цель и назначение услуги..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Краткая характеристика меры социальной поддержки
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Создание..." : "Создать паспорт"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/passports")}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

