import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, Hash, Network, Lock, Calculator, FileText, Settings } from 'lucide-react';
import { cryptoLabApi } from '../lib/api';
import { useToast } from '@/hooks/use-toast';

export function CryptoLabTabs() {
  const { toast } = useToast();

  // Classical Ciphers State
  const [caesarInput, setCaesarInput] = useState('');
  const [caesarShift, setCaesarShift] = useState(3);
  const [caesarOutput, setCaesarOutput] = useState('');
  
  const [vigenereInput, setVigenereInput] = useState('');
  const [vigenereKey, setVigenereKey] = useState('');
  const [vigenereOutput, setVigenereOutput] = useState('');

  // Block & Stream Ciphers State
  const [desInput, setDesInput] = useState('');
  const [desKey, setDesKey] = useState('');
  const [desOutput, setDesOutput] = useState('');
  
  const [aesInput, setAesInput] = useState('');
  const [aesKeySize, setAesKeySize] = useState('256');
  const [aesOutput, setAesOutput] = useState({ ciphertext: '', key: '', iv: '' });

  // Public Key Cryptography State
  const [rsaKeyPair, setRsaKeyPair] = useState({ publicKey: '', privateKey: '', keySize: 2048 });
  const [rsaMessage, setRsaMessage] = useState('');
  const [rsaEncrypted, setRsaEncrypted] = useState('');
  const [rsaDecrypted, setRsaDecrypted] = useState('');

  // Hash & MAC State
  const [hashInput, setHashInput] = useState('');
  const [hashOutput, setHashOutput] = useState({ md5: '', sha256: '', sha3: '' });
  
  const [hmacMessage, setHmacMessage] = useState('');
  const [hmacKey, setHmacKey] = useState('');
  const [hmacOutput, setHmacOutput] = useState('');

  // Mutations
  const caesarMutation = useMutation({
    mutationFn: () => cryptoLabApi.caesar(caesarInput, caesarShift),
    onSuccess: (data) => setCaesarOutput(data.encrypted),
    onError: () => toast({ title: 'Error', description: 'Caesar cipher failed', variant: 'destructive' }),
  });

  const vigenereMutation = useMutation({
    mutationFn: () => cryptoLabApi.vigenere(vigenereInput, vigenereKey),
    onSuccess: (data) => setVigenereOutput(data.encrypted),
    onError: () => toast({ title: 'Error', description: 'Vigenère cipher failed', variant: 'destructive' }),
  });

  const desMutation = useMutation({
    mutationFn: () => cryptoLabApi.des(desInput, desKey),
    onSuccess: (data) => setDesOutput(data.encrypted),
    onError: () => toast({ title: 'Error', description: 'DES encryption failed', variant: 'destructive' }),
  });

  const aesMutation = useMutation({
    mutationFn: () => cryptoLabApi.aes(aesInput, parseInt(aesKeySize)),
    onSuccess: (data) => setAesOutput(data),
    onError: () => toast({ title: 'Error', description: 'AES encryption failed', variant: 'destructive' }),
  });

  const rsaGenerateMutation = useMutation({
    mutationFn: () => cryptoLabApi.generateRsa(rsaKeyPair.keySize),
    onSuccess: (data) => setRsaKeyPair(data),
    onError: () => toast({ title: 'Error', description: 'RSA key generation failed', variant: 'destructive' }),
  });

  const rsaEncryptMutation = useMutation({
    mutationFn: () => cryptoLabApi.rsaEncrypt(rsaMessage, rsaKeyPair.publicKey),
    onSuccess: (data) => setRsaEncrypted(data.encrypted),
    onError: () => toast({ title: 'Error', description: 'RSA encryption failed', variant: 'destructive' }),
  });

  const rsaDecryptMutation = useMutation({
    mutationFn: () => cryptoLabApi.rsaDecrypt(rsaEncrypted, rsaKeyPair.privateKey),
    onSuccess: (data) => setRsaDecrypted(data.decrypted),
    onError: () => toast({ title: 'Error', description: 'RSA decryption failed', variant: 'destructive' }),
  });

  const hashMutation = useMutation({
    mutationFn: () => cryptoLabApi.hash(hashInput),
    onSuccess: (data) => setHashOutput(data),
    onError: () => toast({ title: 'Error', description: 'Hash calculation failed', variant: 'destructive' }),
  });

  const hmacMutation = useMutation({
    mutationFn: () => cryptoLabApi.hmac(hmacMessage, hmacKey),
    onSuccess: (data) => setHmacOutput(data.hmac),
    onError: () => toast({ title: 'Error', description: 'HMAC calculation failed', variant: 'destructive' }),
  });

  return (
    <Tabs defaultValue="classical" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="classical" className="flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Classical</span>
        </TabsTrigger>
        <TabsTrigger value="block-stream" className="flex items-center space-x-2">
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Block & Stream</span>
        </TabsTrigger>
        <TabsTrigger value="public-key" className="flex items-center space-x-2">
          <Key className="h-4 w-4" />
          <span className="hidden sm:inline">Public Key</span>
        </TabsTrigger>
        <TabsTrigger value="hashes" className="flex items-center space-x-2">
          <Hash className="h-4 w-4" />
          <span className="hidden sm:inline">Hashes</span>
        </TabsTrigger>
        <TabsTrigger value="protocols" className="flex items-center space-x-2">
          <Network className="h-4 w-4" />
          <span className="hidden sm:inline">Protocols</span>
        </TabsTrigger>
      </TabsList>

      {/* Classical Ciphers */}
      <TabsContent value="classical">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span>Caesar Cipher</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="caesar-input">Plain Text</Label>
                <Input
                  id="caesar-input"
                  placeholder="Enter message to encrypt..."
                  value={caesarInput}
                  onChange={(e) => setCaesarInput(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="caesar-shift">Shift Value</Label>
                <Input
                  id="caesar-shift"
                  type="number"
                  min="1"
                  max="25"
                  value={caesarShift}
                  onChange={(e) => setCaesarShift(parseInt(e.target.value) || 3)}
                />
              </div>
              <div>
                <Label htmlFor="caesar-output">Cipher Text</Label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono text-sm min-h-[40px]">
                  {caesarOutput || 'Encrypted text will appear here...'}
                </div>
              </div>
              <Button 
                onClick={() => caesarMutation.mutate()}
                disabled={!caesarInput || caesarMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                {caesarMutation.isPending ? 'Encrypting...' : 'Encrypt'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-purple-600" />
                <span>Vigenère Cipher</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vigenere-input">Plain Text</Label>
                <Input
                  id="vigenere-input"
                  placeholder="Enter message to encrypt..."
                  value={vigenereInput}
                  onChange={(e) => setVigenereInput(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vigenere-key">Keyword</Label>
                <Input
                  id="vigenere-key"
                  placeholder="SECRET"
                  value={vigenereKey}
                  onChange={(e) => setVigenereKey(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="vigenere-output">Cipher Text</Label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono text-sm min-h-[40px]">
                  {vigenereOutput || 'Encrypted text will appear here...'}
                </div>
              </div>
              <Button 
                onClick={() => vigenereMutation.mutate()}
                disabled={!vigenereInput || !vigenereKey || vigenereMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                {vigenereMutation.isPending ? 'Encrypting...' : 'Encrypt'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Block & Stream Ciphers */}
      <TabsContent value="block-stream">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <span>DES Algorithm</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="des-input">64-bit Plaintext (Hex)</Label>
                <Input
                  id="des-input"
                  placeholder="0123456789ABCDEF"
                  maxLength={16}
                  className="font-mono"
                  value={desInput}
                  onChange={(e) => setDesInput(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="des-key">64-bit Key (Hex)</Label>
                <Input
                  id="des-key"
                  placeholder="133457799BBCDFF1"
                  maxLength={16}
                  className="font-mono"
                  value={desKey}
                  onChange={(e) => setDesKey(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="des-output">Ciphertext</Label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono text-sm min-h-[40px]">
                  {desOutput || 'Encrypted data will appear here...'}
                </div>
              </div>
              <Button 
                onClick={() => desMutation.mutate()}
                disabled={!desInput || !desKey || desMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                {desMutation.isPending ? 'Encrypting...' : 'Encrypt with DES'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-green-600" />
                <span>AES Algorithm</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="aes-input">Plaintext</Label>
                <Input
                  id="aes-input"
                  placeholder="Enter text to encrypt..."
                  value={aesInput}
                  onChange={(e) => setAesInput(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="aes-keysize">Key Size</Label>
                <Select value={aesKeySize} onValueChange={setAesKeySize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128-bit</SelectItem>
                    <SelectItem value="256">256-bit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="aes-key">Generated Key (Hex)</Label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono text-xs min-h-[40px] break-all">
                  {aesOutput.key || 'Key will appear here...'}
                </div>
              </div>
              <div>
                <Label htmlFor="aes-output">Ciphertext</Label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono text-sm min-h-[40px] break-all">
                  {aesOutput.ciphertext || 'Encrypted text will appear here...'}
                </div>
              </div>
              <Button 
                onClick={() => aesMutation.mutate()}
                disabled={!aesInput || aesMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                {aesMutation.isPending ? 'Encrypting...' : 'Encrypt with AES'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Public Key Cryptography */}
      <TabsContent value="public-key">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-orange-600" />
                <span>RSA Key Pair Generation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rsa-keysize">Key Size</Label>
                <Select 
                  value={rsaKeyPair.keySize.toString()} 
                  onValueChange={(value) => setRsaKeyPair({...rsaKeyPair, keySize: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1024">1024-bit</SelectItem>
                    <SelectItem value="2048">2048-bit</SelectItem>
                    <SelectItem value="4096">4096-bit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => rsaGenerateMutation.mutate()}
                disabled={rsaGenerateMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                {rsaGenerateMutation.isPending ? 'Generating...' : 'Generate Key Pair'}
              </Button>
              
              <div>
                <Label htmlFor="rsa-public">Public Key</Label>
                <Textarea
                  id="rsa-public"
                  className="font-mono text-xs"
                  rows={4}
                  readOnly
                  value={rsaKeyPair.publicKey || 'Public key will appear here...'}
                />
              </div>
              
              <div>
                <Label htmlFor="rsa-private">Private Key</Label>
                <Textarea
                  id="rsa-private"
                  className="font-mono text-xs"
                  rows={3}
                  readOnly
                  value={rsaKeyPair.privateKey || 'Private key will appear here...'}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span>RSA Encrypt/Decrypt</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rsa-message">Message</Label>
                <Input
                  id="rsa-message"
                  placeholder="Enter message to encrypt..."
                  value={rsaMessage}
                  onChange={(e) => setRsaMessage(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => rsaEncryptMutation.mutate()}
                  disabled={!rsaMessage || !rsaKeyPair.publicKey || rsaEncryptMutation.isPending}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Encrypt
                </Button>
                <Button 
                  onClick={() => rsaDecryptMutation.mutate()}
                  disabled={!rsaEncrypted || !rsaKeyPair.privateKey || rsaDecryptMutation.isPending}
                  variant="outline"
                  className="flex-1"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Decrypt
                </Button>
              </div>
              
              <div>
                <Label htmlFor="rsa-encrypted">Encrypted Message</Label>
                <Textarea
                  id="rsa-encrypted"
                  className="font-mono text-xs"
                  rows={3}
                  readOnly
                  value={rsaEncrypted || 'Encrypted message will appear here...'}
                />
              </div>
              
              <div>
                <Label htmlFor="rsa-decrypted">Decrypted Message</Label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 min-h-[40px]">
                  {rsaDecrypted || 'Decrypted message will appear here...'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Hash & MAC */}
      <TabsContent value="hashes">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-teal-600" />
                <span>Hash Functions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hash-input">Input Message</Label>
                <Input
                  id="hash-input"
                  placeholder="Enter message to hash..."
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="hash-md5">MD5 Hash</Label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono text-sm min-h-[40px] break-all">
                  {hashOutput.md5 || 'MD5 hash will appear here...'}
                </div>
              </div>
              
              <div>
                <Label htmlFor="hash-sha256">SHA-256 Hash</Label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono text-xs min-h-[40px] break-all">
                  {hashOutput.sha256 || 'SHA-256 hash will appear here...'}
                </div>
              </div>
              
              <div>
                <Label htmlFor="hash-sha3">SHA-3-256 Hash</Label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono text-xs min-h-[40px] break-all">
                  {hashOutput.sha3 || 'SHA-3-256 hash will appear here...'}
                </div>
              </div>
              
              <Button 
                onClick={() => hashMutation.mutate()}
                disabled={!hashInput || hashMutation.isPending}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {hashMutation.isPending ? 'Calculating...' : 'Calculate Hashes'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span>HMAC Authentication</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hmac-message">Message</Label>
                <Input
                  id="hmac-message"
                  placeholder="Enter message..."
                  value={hmacMessage}
                  onChange={(e) => setHmacMessage(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="hmac-key">Secret Key</Label>
                <Input
                  id="hmac-key"
                  placeholder="Enter secret key..."
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="hmac-result">HMAC-SHA256</Label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 font-mono text-xs min-h-[40px] break-all">
                  {hmacOutput || 'HMAC will appear here...'}
                </div>
              </div>
              
              <Button 
                onClick={() => hmacMutation.mutate()}
                disabled={!hmacMessage || !hmacKey || hmacMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <Key className="h-4 w-4 mr-2" />
                {hmacMutation.isPending ? 'Calculating...' : 'Calculate HMAC'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Protocols */}
      <TabsContent value="protocols">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-blue-600" />
              <span>TLS Handshake Protocol</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-4xl mb-4">🤝</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Interactive TLS Handshake</h4>
                  <p className="text-gray-500 mb-4">Step-by-step visualization of the TLS handshake process</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Start Handshake Simulation
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900">Client Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex items-center space-x-2">
                        <Badge className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</Badge>
                        <span>Send ClientHello</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</Badge>
                        <span>Verify Certificate</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">4</Badge>
                        <span>Generate Pre-master Secret</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-900">Server Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-green-800">
                      <div className="flex items-center space-x-2">
                        <Badge className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">2</Badge>
                        <span>Send ServerHello + Certificate</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">5</Badge>
                        <span>Decrypt Pre-master Secret</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">6</Badge>
                        <span>Generate Session Keys</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
