'use client';

import { toast } from 'sonner';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, FileUp, LoaderCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { checkDuplicateNames } from '@/utils/storeValidations';
import { validateRow } from '@/actions/stores';
import { RowErrors } from '@/types/store';

// Define field type
type Field = {
    id: string;
    name: string;
    value: string;
    required: boolean;
};

// Define mapping type
type Mapping = {
    fieldId: string;
    value: string;
    headerIndex: number | null;
};

export function StoresCsvImporter({
    importFields,
    brand
}: {
    importFields: Field[];
    brand: string;
}) {
    // State for fields
    const [fields, setFields] = useState<Field[]>(importFields);
    const [isPending, startTransition] = useTransition();

    // State for CSV data
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);
    const [mappings, setMappings] = useState<Mapping[]>([]);

    // State for current tab
    const [activeTab, setActiveTab] = useState('define');

    // State for validation
    const [validationError, setValidationError] = useState<string | null>(null);
    const [validationDataError, setValidationDataError] = useState<
        string | null
    >(null);
    const [duplicateNamesError, setDuplicationNamesError] = useState<
        ReturnType<typeof checkDuplicateNames>
    >([]);
    const [validationRowErrors, setValidationRowErrors] = useState<RowErrors[]>(
        []
    );

    const [importSuccess, setImportSuccess] = useState(false);

    // Handle file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setValidationError(null);
        setImportSuccess(false);

        // Parse CSV
        const text = await uploadedFile.text();
        const lines = text
            .split('\n')
            .map((line) =>
                line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, ''))
            );

        if (lines.length < 2) {
            setValidationError(
                'CSV file must contain headers and at least one data row'
            );
            return;
        }

        const csvHeaders = lines[0];
        const csvRows = lines
            .slice(1)
            .filter((row) => row.some((cell) => cell.trim() !== ''));

        setHeaders(csvHeaders);
        setRows(csvRows);

        // Initialize mappings
        setMappings(
            fields.map((field) => ({
                fieldId: field.id,
                value: field.value,
                headerIndex:
                    csvHeaders.findIndex(
                        (header) =>
                            header.toLowerCase() === field.value.toLowerCase()
                    ) !== -1
                        ? csvHeaders.findIndex(
                              (header) =>
                                  header.toLowerCase() ===
                                  field.value.toLowerCase()
                          )
                        : null
            }))
        );

        // Move to mapping tab
        setActiveTab('map');
    };

    // Update mapping
    const updateMapping = (fieldId: string, headerIndex: number | null) => {
        setMappings(
            mappings.map((mapping) =>
                mapping.fieldId === fieldId
                    ? { ...mapping, headerIndex }
                    : mapping
            )
        );
    };

    const validateMappings = () => {
        setValidationError(null);

        // Check if all required fields are mapped
        const unmappedRequiredFields = fields
            .filter((field) => field.required)
            .filter((field) => {
                const mapping = mappings.find((m) => m.fieldId === field.id);
                return !mapping || mapping.headerIndex === null;
            });

        if (unmappedRequiredFields.length > 0) {
            const errorMessage = `Required fields not mapped: ${unmappedRequiredFields.map((f) => f.name).join(', ')}`;
            setValidationError(errorMessage);

            // Show toast notification
            toast.error('Validation Error', { description: errorMessage });

            return false;
        }

        return true;
    };

    const validateData = () => {
        setValidationDataError(null);
        setDuplicationNamesError([]);

        startTransition(async () => {
            const merged = rows.map((row) => {
                const obj: Record<string, string> = {};

                for (const mapping of mappings) {
                    if (mapping.headerIndex || mapping.headerIndex === 0)
                        obj[mapping.value] = row[mapping.headerIndex];
                }

                return obj;
            });

            const duplicateNames = checkDuplicateNames({ data: merged });
            if (duplicateNames.length > 0) {
                setValidationDataError('duplicate');
                setDuplicationNamesError(duplicateNames);
            } else {
                const rowErrors: RowErrors[] = [];
                let i = 2;

                for (const row of merged) {
                    const validatedRow = await validateRow({
                        data: row,
                        brand
                    });
                    if (validatedRow.length > 0)
                        rowErrors.push({ row: i, errors: validatedRow });
                    i++;
                }
                if (rowErrors.length > 0) {
                    setValidationDataError('validation');
                    setValidationRowErrors(rowErrors);
                }
            }
        });
    };

    // Process import
    const processImport = () => {
        if (!validateMappings()) return;

        // Here you would typically send the data to your backend
        // For this example, we'll just simulate a successful import

        console.log('Processing import with mappings:', mappings);
        console.log('Data to import:', rows);

        // Show success message
        setImportSuccess(true);

        // Reset for new import
        setTimeout(() => {
            // setActiveTab('define');
            setFile(null);
            setHeaders([]);
            setRows([]);
            setMappings([]);
            setImportSuccess(false);
        }, 3000);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>CSV Importer</CardTitle>
                <CardDescription>
                    Define fields, upload a CSV file, map headers, and import
                    your data
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="define">
                            1. Define Fields
                        </TabsTrigger>
                        <TabsTrigger value="map" disabled={!file}>
                            2. Map Headers
                        </TabsTrigger>
                        <TabsTrigger
                            value="validate"
                            disabled={!file || mappings.length === 0}
                        >
                            3. Validate
                        </TabsTrigger>
                        <TabsTrigger
                            value="import"
                            disabled={!file || mappings.length === 0}
                        >
                            4. Import
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="define">
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="fields">Fields</Label>
                                <div className="border rounded-md p-4">
                                    {fields.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-4">
                                            No fields defined yet
                                        </p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {fields.map((field) => (
                                                <li
                                                    key={field.id}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {field.name}
                                                        </span>
                                                        {field.required && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                Required
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="csv-upload"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <Label
                                        htmlFor="csv-upload"
                                        className="cursor-pointer flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed rounded-md hover:bg-muted transition-colors"
                                    >
                                        <FileUp className="h-6 w-6" />
                                        <span>Upload CSV File</span>
                                    </Label>
                                </div>
                                {file && (
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Selected file: {file.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="map">
                        {headers.length > 0 && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">
                                        Map CSV Headers to Fields
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Match each of your defined fields to a
                                        column in your CSV file
                                    </p>

                                    <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Field</TableHead>
                                                    <TableHead>
                                                        Required
                                                    </TableHead>
                                                    <TableHead>
                                                        CSV Header
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {fields.map((field) => {
                                                    const mapping =
                                                        mappings.find(
                                                            (m) =>
                                                                m.fieldId ===
                                                                field.id
                                                        );
                                                    const headerIndex = mapping
                                                        ? mapping.headerIndex
                                                        : null;

                                                    return (
                                                        <TableRow
                                                            key={field.id}
                                                        >
                                                            <TableCell>
                                                                {field.name}
                                                            </TableCell>
                                                            <TableCell>
                                                                {field.required ? (
                                                                    <Badge variant="outline">
                                                                        Required
                                                                    </Badge>
                                                                ) : (
                                                                    'Optional'
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    value={
                                                                        headerIndex !==
                                                                        null
                                                                            ? headerIndex.toString()
                                                                            : 'not_mapped'
                                                                    }
                                                                    onValueChange={(
                                                                        value
                                                                    ) =>
                                                                        updateMapping(
                                                                            field.id,
                                                                            value ===
                                                                                'not_mapped'
                                                                                ? null
                                                                                : Number.parseInt(
                                                                                      value
                                                                                  )
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Select a header" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="not_mapped">
                                                                            Not
                                                                            mapped
                                                                        </SelectItem>
                                                                        {headers.map(
                                                                            (
                                                                                header,
                                                                                index
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    value={index.toString()}
                                                                                >
                                                                                    {
                                                                                        header
                                                                                    }
                                                                                </SelectItem>
                                                                            )
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2">
                                        CSV Preview
                                    </h3>
                                    <ScrollArea className="h-[200px] border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {headers.map(
                                                        (header, index) => (
                                                            <TableHead
                                                                key={index}
                                                            >
                                                                {header}
                                                            </TableHead>
                                                        )
                                                    )}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {rows
                                                    .slice(0, 5)
                                                    .map((row, rowIndex) => (
                                                        <TableRow
                                                            key={rowIndex}
                                                        >
                                                            {row.map(
                                                                (
                                                                    cell,
                                                                    cellIndex
                                                                ) => (
                                                                    <TableCell
                                                                        key={
                                                                            cellIndex
                                                                        }
                                                                    >
                                                                        {cell}
                                                                    </TableCell>
                                                                )
                                                            )}
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                    {rows.length > 5 && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Showing 5 of {rows.length} rows
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="validate">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium mb-2">
                                    Validation
                                </h3>
                                {validationError ? (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {validationError}
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertDescription>
                                            All required fields are mapped
                                            correctly
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">
                                    Import Summary
                                </h3>
                                <div className="border rounded-md p-4 space-y-2">
                                    <p>
                                        <strong>File:</strong> {file?.name}
                                    </p>
                                    <p>
                                        <strong>Total Rows:</strong>{' '}
                                        {rows.length}
                                    </p>
                                    <p>
                                        <strong>Mapped Fields:</strong>{' '}
                                        {
                                            mappings.filter(
                                                (m) => m.headerIndex !== null
                                            ).length
                                        }{' '}
                                        of {fields.length}
                                    </p>
                                </div>
                            </div>

                            {importSuccess && (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <AlertDescription className="text-green-700">
                                        CSV data imported successfully!
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </TabsContent>
                    <TabsContent value="import">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium mb-2">
                                    Data Validation
                                </h3>
                                {isPending ? (
                                    <Alert>
                                        <AlertDescription>
                                            <LoaderCircle className="animate-spin" />
                                        </AlertDescription>
                                    </Alert>
                                ) : validationDataError ? (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {validationDataError === 'duplicate'
                                                ? 'There were duplicate names, please see the rows below and re-import'
                                                : 'There were errors in your data import, please see below and re-import'}
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertDescription>
                                            All required fields are ready for
                                            import
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            {validationDataError && (
                                <div>
                                    <h3 className="text-lg font-medium mb-2">
                                        Data Validation Summary
                                    </h3>
                                    {isPending ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        <div className="border rounded-md p-4 space-y-2">
                                            <p>
                                                <strong>File:</strong>{' '}
                                                {file?.name}
                                            </p>
                                            {validationDataError ===
                                            'duplicate' ? (
                                                <>
                                                    <p>
                                                        <strong>
                                                            Duplicate names:
                                                        </strong>{' '}
                                                        {
                                                            duplicateNamesError.length
                                                        }
                                                    </p>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[100px]">
                                                                    Name
                                                                </TableHead>
                                                                <TableHead>
                                                                    Rows
                                                                    Affected
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {duplicateNamesError.map(
                                                                (
                                                                    duplicate,
                                                                    index
                                                                ) => (
                                                                    <TableRow
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <TableCell className="font-medium align-text-top">
                                                                            {
                                                                                duplicate.name
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="align-text-top">
                                                                            <div className="flex flex-col">
                                                                                {duplicate.rows.map(
                                                                                    (
                                                                                        row
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                row
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                row
                                                                                            }
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </>
                                            ) : (
                                                <>
                                                    <p>
                                                        <strong>
                                                            Row Error Totals:
                                                        </strong>{' '}
                                                        {
                                                            validationRowErrors.length
                                                        }
                                                    </p>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[100px]">
                                                                    Row Number
                                                                </TableHead>
                                                                <TableHead>
                                                                    Fields
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {validationRowErrors.map(
                                                                (
                                                                    error,
                                                                    index
                                                                ) => (
                                                                    <TableRow
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <TableCell className="font-medium align-text-top">
                                                                            {
                                                                                error.row
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="align-text-top">
                                                                            <div className="flex flex-col">
                                                                                {error.errors.map(
                                                                                    (
                                                                                        issue,
                                                                                        index
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                index
                                                                                            }
                                                                                        >
                                                                                            {`${issue.field} - ${issue.error}`}
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                )
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {importSuccess && (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <AlertDescription className="text-green-700">
                                        CSV data imported successfully!
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={() => {
                        if (activeTab === 'map') setActiveTab('define');
                        if (activeTab === 'validate') setActiveTab('map');
                        if (activeTab === 'import') setActiveTab('validate');
                    }}
                    disabled={activeTab === 'define'}
                >
                    Back
                </Button>
                <Button
                    onClick={() => {
                        if (activeTab === 'define' && file) setActiveTab('map');
                        else if (activeTab === 'map') {
                            if (validateMappings()) setActiveTab('validate');
                        } else if (activeTab === 'validate') {
                            validateData();
                            setActiveTab('import');
                        } else if (activeTab === 'import') processImport();
                    }}
                    disabled={
                        (activeTab === 'define' && !file) ||
                        (activeTab === 'import' &&
                            validationDataError !== null) ||
                        importSuccess
                    }
                >
                    {activeTab === 'import' ? 'Process Import' : 'Next'}
                </Button>
            </CardFooter>
        </Card>
    );
}
