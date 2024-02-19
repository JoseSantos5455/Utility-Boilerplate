"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function Profile() {
    return (
        <div className="pt-4 flex items-center justify-center">
            <Card className="flex flex-col items-center">
                <CardHeader className="flex flex-row gap-6" >
                    <Image className="rounded-lg" width={144} height={144} src={`/bull.jpg`} alt="" />
                    <div className="flex  flex-col items-center justify-around">
                        <CardTitle className="text-4xl">Username</CardTitle>
                        <CardDescription>+realm.subrealm</CardDescription>
                        <Button>See more</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <p>Card Content</p>
                </CardContent>
                <CardFooter>
                    <p>Card Footer</p>
                </CardFooter>
            </Card>
        </div>
    );
}